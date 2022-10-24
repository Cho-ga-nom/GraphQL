/**
 * SDL: GraphQL Schema Language
 * GraphQL에게 데이터 타입을 알려주는 코드
 * 
 * type Query {
 *  text: String    ==   GET /text
 * }
 * 
 * type Mutation {
 *  text: String    ==   POST /text
 * }
 * 
 * post, delete, update 모두 Mutation 내부에 작성
 * 
 * GraphQL은 기본적으로 null 허용.
 * !를 붙이면 not null
 * 
 */

import { ApolloServer, gql } from 'apollo-server';

/**
 * 데이터베이스 역할을 하는 가짜 DB
 */

let tweets = [
  {
    id: "1",
    text: "hello",
    userId: "2",
  },
  {
    id: "2",
    text: "bye",
    userId: "1",
  },
];

let users = [
  {
    id: "1",
    firstName: "nico",
    lastName: "last",
  },
  {
    id: "2",
    firstName: "Elon",
    lastName: "Mask",
  }
];

const typeDefs = gql`
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    fullName: String!
  }
  type Tweet {
    id: ID!
    text: String
    author: User!
  }
  type Query {
    allUsers: [User!]!
    allTweets: [Tweet!]!
    tweet(id: ID): Tweet!
  }
  type Mutation {
    postTweet(text: String, userId: ID): Tweet!
    deleteTweet(id:ID): Boolean
  }
`;

/**
 * resolver는 typeDef와 같은 형태를 가져야 한다.
 * resolver 함수 내에서 데이터베이스에 접근하다. SQL을 쓰는 자리.
 */

const resolvers = {
  Query: {
    allTweets() {           // tweet query 요청을 보내면 호출되는 함수
      return tweets;
    },
    tweet(_, {id}) {
      return tweets.find((tweet) => tweet.id == id);
    },
    allUsers() {
      return users;
    },
  },

  Mutation: {
    postTweet(_, {text, userId}) {
      const newTweet = {
        id: tweets.length + 1,
        text,
      };
      tweets.push(newTweet);
      return newTweet;
    },
    deleteTweet(_, {id}) {
      const tweet = tweets.find((tweet) => tweet.id == id);
      
      if(!tweet) return false;
      tweets = tweets.filter((tweet) => tweet.id != id);
      return true;
    },
  },

  /**
   * root 매개변수에는 resolver를 호출한 객체가 들어있다.
   * 밑의 코드에서는 fullName을 호출한 User가 들어가 있다.
   */

  User: {
    fullName({firstName, lastName}) {
      return `${firstName} ${lastName}`;
    }
  },

  Tweet: {
    author({userId}) {
      return users.find((user) => user.id == userId);
    },
  },
};

const server = new ApolloServer({typeDefs, resolvers});

server.listen().then(({ url }) => {
  console.log(`Running on ${url}`);
});