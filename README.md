# json-graphql-server
 ![travis (.org)](https://img.shields.io/travis/marmelab/json-graphql-server.svg) ![github top language](https://img.shields.io/github/languages/top/marmelab/json-graphql-server.svg) ![David. dependencies](https://david-dm.org/marmelab/json-graphql-server.svg) ![npm](https://img.shields.io/npm/v/json-graphql-server.svg) ![github contributors](https://img.shields.io/github/contributors/marmelab/json-graphql-server.svg) ![license](https://img.shields.io/github/license/marmelab/json-graphql-server.svg) ![prs welcome](https://img.shields.io/badge/prs-welcome-brightgreen.svg)

Get a full fake GraphQL API with zero coding in less than 30 seconds.

## Motivation

> I'd love to learn GraphQL, but it seems that I first have to read a book about GraphQL Types and Queries, then install a gazillion npm packages.
> - About every developer

Start playing with GraphQL right away with `json-graphql-server`, a testing and mocking tool for GraphQL. All it takes is a JSON of your data.

Inspired by the excellent [json-server](https://github.com/typicode/json-server).

## Example

Create a `db.js` file.

Your data file should export an object where the keys are the entity types. The values should be lists of entities, i.e. arrays of value objects with at least an `id` key. For instance:

```js
module.exports = {
    posts: [
        { id: 1, title: "Lorem Ipsum", views: 254, user_id: 123 },
        { id: 2, title: "Sic Dolor amet", views: 65, user_id: 456 },
    ],
    users: [
        { id: 123, name: "John Doe" },
        { id: 456, name: "Jane Doe" }
    ],
    comments: [
        { id: 987, post_id: 1, body: "Consectetur adipiscing elit", date: new Date('2017-07-03') },
        { id: 995, post_id: 1, body: "Nam molestie pellentesque dui", date: new Date('2017-08-17') }
    ]
}
```

Start the GraphQL server on localhost, port 3000.

```sh
json-graphql-server db.js
```

To use a port other than 3000, you can run `json-graphql-server db.js --p <your port here>`
To use a host other than localhost, you can run `json-graphql-server db.js --h <your host here>`

Now you can query your data in graphql. For instance, to issue the following query:

```graphql
{
    Post(id: 1) {
        id
        title
        views
        User {
            name
        }
        Comments {
            date
            body
        }
    }
}
```

Go to http://localhost:3000/?query=%7B%20Post%28id%3A%201%29%20%7B%20id%20title%20views%20User%20%7B%20name%20%7D%20Comments%20%7B%20date%20body%20%7D%20%7D%20%7D. You'll get the following result:

```json
{
    "data": {
        "Post": {
            "id": "1",
            "title": "Lorem Ipsum",
            "views": 254,
            "User": {
                "name": "John Doe"
            },
            "Comments": [
                { "date": "2017-07-03T00:00:00.000Z", "body": "Consectetur adipiscing elit" },
                { "date": "2017-08-17T00:00:00.000Z", "body": "Nam molestie pellentesque dui" },
            ]
        }
    }
}
```

The json-graphql-server accepts queries in GET and POST. Under the hood, it uses [the `express-graphql` module](https://github.com/graphql/express-graphql). Please refer to their documentations for details about passing variables, etc.

Note that the server is [GraphiQL](https://github.com/graphql/graphiql) enabled, so you can query your server using a full-featured graphical user interface, providing autosuggest, history, etc.

![GraphiQL client using json-graphql-server](http://static.marmelab.com/graphiql-json.png)

## Install

```sh
npm install -g json-graphql-server
```

## Generated Types and Queries

Based on your data, json-graphql-server will generate a schema with one type per entity, as well as 3 query types and 3 mutation types. For instance for the `Post` entity:

```graphql
type Query {
  Post(id: ID!): Post
  allPosts(page: Int, perPage: Int, sortField: String, sortOrder: String, filter: PostFilter): [Post]
  _allPostsMeta(page: Int, perPage: Int, sortField: String, sortOrder: String, filter: PostFilter): ListMetadata
}
type Mutation {
  createPost(data: String): Post
  createManyPost(data: [{data:String}]): [Post]
  updatePost(data: String): Post
  removePost(id: ID!): Post
}
type Post {
    id: ID!
    title: String!
    views: Int!
    user_id: ID!
    User: User
    Comments: [Comment]
}
type PostFilter {
    q: String
    id: ID
    id_neq: ID
    title: String
    title_neq: String
    views: Int
    views_lt: Int
    views_lte: Int
    views_gt: Int
    views_gte: Int
    views_neq: Int
    user_id: ID    
    user_id_neq: ID
}
type ListMetadata {
    count: Int!
}
scalar Date
```

By convention, json-graphql-server expects all entities to have an `id` field that is unique for their type - it's the entity primary key. The type of every field is inferred from the values, so for instance, `Post.title` is a `String!`, and `Post.views` is an `Int!`. When all entities have a value for a field, json-graphql-server makes the field type non nullable (that's why `Post.views` type is `Int!` and not `Int`).

For every field named `*_id`, json-graphql-server creates a two-way relationship, to let you fetch related entities from both sides. For instance, the presence of the `user_id` field in the `posts` entity leads to the ability to fetch the related `User` for a `Post` - and the related `Posts` for a `User`.

The `all*` queries accept parameters to let you sort, paginate, and filter the list of results. You can filter by any field, not just the primary key. For instance, you can get the posts written by user `123`. Json-graphql-server also adds a full-text query field named `q`, and created range filter fields for numeric and date fields. All types (excluding booleans and arrays) get a not equal filter. The detail of all available filters can be seen in the generated `*Filter` type.

## GraphQL Usage

Here is how you can use the queries and mutations generated for your data, using `Post` as an example:

<table>
    <tr>
        <th>Query / Mutation</th>
        <th>Result</th>
    </tr>
    <tr>
        <td>
            <pre>
// get a single entity, by id
{
  Post(id: 1) {
    id
    title
    views
    user_id
  }
}
            </pre>
        </td>
        <td>
            <pre>
{
  "data": {
    "Post": {
        "id": 1,
        "title": "Lorem Ipsum",
        "views": 254,
        "user_id": 123
    } 
  }
}
            </pre>
        </td>
    </tr>
    <tr>
        <td>
            <pre>
// include many-to-one relationships
{
  Post(id: 1) {
    title
    User {
        name
    }
  }
}
            </pre>
        </td>
        <td>
            <pre>
{
  "data": {
    "Post": {
        "title": "Lorem Ipsum",
        "User": {
            "name": "John Doe"
        }
    } 
  }
}
            </pre>
        </td>
    </tr>
    <tr>
        <td>
            <pre>
// include one-to-many relationships
{
  Post(id: 1) {
    title
    Comments {
        body
    }
  }
}
            </pre>
        </td>
        <td>
            <pre>
{
  "data": {
    "Post": {
        "title": "Lorem Ipsum",
        "Comments": [
            { "body": "Consectetur adipiscing elit" },
            { "body": "Nam molestie pellentesque dui" },
        ]
    } 
  }
}
            </pre>
        </td>
    </tr>
    <tr>
        <td>
            <pre>
// get a list of entities for a type
{
  allPosts {
    title
    views
  }
}
            </pre>
        </td>
        <td>
            <pre>
{
  "data": {
    "allPosts": [
      { "title": "Lorem Ipsum", views: 254 },
      { "title": "Sic Dolor amet", views: 65 }
    ]
  }
}
            </pre>
        </td>
    </tr>
    <tr>
        <td>
            <pre>
// paginate the results
{
  allPosts(page: 0, perPage: 1) {
    title
    views
  }
}
            </pre>
        </td>
        <td>
            <pre>
{
  "data": {
    "allPosts": [
      { "title": "Lorem Ipsum", views: 254 },
    ]
  }
}
            </pre>
        </td>
    </tr>
    <tr>
        <td>
            <pre>
// sort the results by field
{
  allPosts(sortField: "title", sortOrder: "desc") {
    title
    views
  }
}
            </pre>
        </td>
        <td>
            <pre>
{
  "data": {
    "allPosts": [
      { "title": "Sic Dolor amet", views: 65 }
      { "title": "Lorem Ipsum", views: 254 },
    ]
  }
}
            </pre>
        </td>
    </tr>
    <tr>
        <td>
            <pre>
// filter the results using the full-text filter
{
  allPosts(filter: { q: "lorem" }) {
    title
    views
  }
}
            </pre>
        </td>
        <td>
            <pre>
{
  "data": {
    "allPosts": [
      { "title": "Lorem Ipsum", views: 254 },
    ]
  }
}
            </pre>
        </td>
    </tr>
    <tr>
        <td>
            <pre>
// filter the result using any of the entity fields
{
  allPosts(filter: { views: 254 }) {
    title
    views
  }
}
            </pre>
        </td>
        <td>
            <pre>
{
  "data": {
    "allPosts": [
      { "title": "Lorem Ipsum", views: 254 },
    ]
  }
}
            </pre>
        </td>
    </tr>
    <tr>
        <td>
            <pre>
// all fields (except boolean and array) get not equal filters
// -lt, _lte, -gt, and _gte
{
  allPosts(filter: { title_neq: "Lorem Ipsum" }) {
    title
    views
  }
}
            </pre>
        </td>
        <td>
            <pre>
{
  "data": {
    "allPosts": [
      { "title": "Some Other Title", views: 254 },
    ]
  }
}
            </pre>
        </td>
    </tr>

    <tr>
        <td>
            <pre>
// number fields get range filters
// -lt, _lte, -gt, and _gte
{
  allPosts(filter: { views_gte: 200 }) {
    title
    views
  }
}
            </pre>
        </td>
        <td>
            <pre>
{
  "data": {
    "allPosts": [
      { "title": "Lorem Ipsum", views: 254 },
    ]
  }
}
            </pre>
        </td>
    </tr>
</table>

## Usage with Node

Install the module locally:

```sh
npm install --save-dev json-graphql-server
```

Then use the `jsonGraphqlExpress` express middleware:

```js
import express from 'express';
import jsonGraphqlExpress from 'json-graphql-server';

const PORT = 3000;
const app = express();
const data = {
    // ... your data
};
app.use('/graphql', jsonGraphqlExpress(data));
app.listen(PORT);
```

## Usage in browser with XMLHttpRequest

Useful when using XMLHttpRequest directly or libraries such as [axios](https://www.npmjs.com/package/axios).

### Install with a script tag

Add a `script` tag referencing the library:

```html
<script src="../lib/json-graphql-server.min.js"></script>
```

It will expose the `JsonGraphqlServer` as a global object:

```html
<script type="text/javascript">
    window.addEventListener('load', function() {
        const data = [...];

        const server = JsonGraphqlServer({
            data,
            url: 'http://localhost:3000/graphql'
        });

        server.start();

        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://localhost:3000/graphql', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.onerror = function(error) {
            console.error(error);
        }
        xhr.onload = function() {
            const result = JSON.parse(xhr.responseText);
            console.log('data returned:', result);
            alert('Found ' + result.data.allPosts.length + ' posts');
        }
        const body = JSON.stringify({ query: 'query allPosts { allPosts { id } }' });
        xhr.send(body);
    });
</script>
```

### Use with a bundler (webpack)

```sh
npm install json-graphql-server
```

```js
import JsonGraphqlServer from 'json-graphql-server';

const data = [...];

const server = JsonGraphqlServer({
    data,
    url: 'http://localhost:3000/graphql'
});

server.start();

const xhr = new XMLHttpRequest();
xhr.open('POST', 'http://localhost:3000/graphql', true);
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.setRequestHeader('Accept', 'application/json');
xhr.onerror = function(error) {
    console.error(error);
}
xhr.onload = function() {
    const result = JSON.parse(xhr.responseText);
    console.log('data returned:', result);
    alert('Found ' + result.data.allPosts.length + ' posts');
}
const body = JSON.stringify({ query: 'query allPosts { allPosts { id } }' });
xhr.send(body);
```

## Usage in browser with fetch

```js
import fetchMock from 'fetch-mock';
import JsonGraphqlServer from 'json-graphql-server';

const data = [...];
const server = JsonGraphqlServer({ data });

fetchMock.post('http://localhost:3000/graphql', server.getHandler());

fetch({
    url: 'http://localhost:3000/graphql',
    method: 'POST',
    body: JSON.stringify({ query: 'query allPosts { allPosts { id } }' })
})
.then(response => response.json())
.then(json => {
    alert('Found ' + result.data.allPosts.length + ' posts');
})
```

## Adding Authentication, Custom Routes, etc.

`json-graphql-server` doesn't deal with authentication or custom routes. But you can use your favorite middleware with Express:

```js
import express from 'express';
import jsonGraphqlExpress from 'json-graphql-server';

import OAuthSecurityMiddleWare from './path/to/OAuthSecurityMiddleWare';

const PORT = 3000;
const app = express();
const data = {
    // ... your data
};
app.use(OAuthSecurityMiddleWare());
app.use('/graphql', jsonGraphqlExpress(data));
app.listen(PORT);
```

## Schema Export

You can also use the export `jsonSchemaBuilder` to get your own copy of the GraphQLSchema:

In  node:
```js
import {graphql} from 'graphql';
import {jsonSchemaBuilder} from 'json-graphql-server';

const data = { };
const schema = jsonSchemaBuilder(data);
const query = `[...]`

graphql(schema, query).then(result => {
  console.log(result);
});
```

Or available in the global scope when running on a client as `jsonSchemaBuilder`.

## Plain Schema

If you want to use another server type instead of the built in graphql express,
like apollo-server or etc, you can expose the plain schema to be built into
an executable schema (there may be version issues otherwise).

This uses the export `getPlainSchema`.

```js
import {ApolloServer} from 'apollo-server';
import {makeExecutableSchema} from '@graphql-tools/schema'; // or graphql-tools
import {applyMiddleware} from 'graphql-middleware';
import {getPlainSchema} from 'json-graphql-server';

const data = { };
const schema = applyMiddleware(
  makeExecutableSchema(getPlainSchema(data), exampleMiddleware)
);

const server = new ApolloServer({
  schema
});

server.listen({ port:3000 });

```

## Deployment

Deploy with Heroku or Next.js.

## Roadmap

* CLI options (https, watch, delay, custom schema)
* Subscriptions
* Client-side mocking (à la [FakeRest](https://github.com/marmelab/FakeRest))

## Contributing

Use Prettier formatting and make sure you include unit tests. The project includes a `Makefile` to automate usual developer tasks:

```sh
make install
make build
make test
make watch
make format
```

To learn more about the contributions to this project, consult the [contribution guide](/.github/CONTRIBUTING.md).

## Maintainers

[![fzaninotto](https://avatars2.githubusercontent.com/u/99944?s=96&amp;v=4)](https://github.com/fzaninotto) | [![djhi](https://avatars1.githubusercontent.com/u/1122076?s=96&amp;v=4)](https://github.com/djhi) | [![alexisjanvier](https://avatars1.githubusercontent.com/u/547706?s=96&amp;v=4)](https://github.com/alexisjanvier)
:---:|:---:|:---:
[Francois Zaninotto](https://github.com/fzaninotto) | [Gildas Garcia](https://github.com/djhi) | [Alexis Janvier](https://github.com/alexisjanvier)

## License

json-graphql-server is licensed under the [MIT Licence](https://github.com/marmelab/json-graphql-server/blob/master/LICENSE.md), sponsored and supported by [marmelab](http://marmelab.com).
