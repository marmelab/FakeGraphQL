import {
    GraphQLBoolean,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLString,
} from 'graphql';
import getSchemaFromData from './getSchemaFromData';

const data = {
    posts: [
        {
            id: 1,
            title: 'Lorem Ipsum',
            views: 254,
            user_id: 123,
        },
        {
            id: 2,
            title: 'Sic Dolor amet',
            views: 65,
            user_id: 456,
        },
    ],
    users: [
        {
            id: 123,
            name: 'John Doe',
        },
        {
            id: 456,
            name: 'Jane Doe',
        },
    ],
};

const PostType = new GraphQLObjectType({
    name: 'Post',
    fields: {
        id: { type: GraphQLString },
        title: { type: GraphQLString },
        views: { type: GraphQLString },
        user_id: { type: GraphQLString },
    },
});
const PostPageType = new GraphQLObjectType({
    name: 'PostPage',
    fields: {
        items: { type: new GraphQLList(PostType) },
        totalCount: { type: GraphQLInt },
    },
});
const UserType = new GraphQLObjectType({
    name: 'User',
    fields: {
        id: { type: GraphQLString },
        name: { type: GraphQLString },
    },
});
const UserPageType = new GraphQLObjectType({
    name: 'UserPage',
    fields: {
        items: { type: new GraphQLList(UserType) },
        totalCount: { type: GraphQLInt },
    },
});

const QueryType = new GraphQLObjectType({ // eslint-disable-line 
    name: 'Query',
    fields: {
        getPost: {
            type: PostType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
            },
        },
        getPageOfPost: {
            type: PostPageType,
            args: {
                page: { type: GraphQLInt },
                perPage: { type: GraphQLInt },
                sortField: { type: GraphQLString },
                sortOrder: { type: GraphQLString },
                filter: { type: GraphQLString },
            },
        },
        getUser: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
            },
        },
        getPageOfUser: {
            type: UserPageType,
            args: {
                page: { type: GraphQLInt },
                perPage: { type: GraphQLInt },
                sortField: { type: GraphQLString },
                sortOrder: { type: GraphQLString },
                filter: { type: GraphQLString },
            },
        },
    },
});

test('creates one type and one page type per data type', () => {
    const typeMap = getSchemaFromData(data).getTypeMap();
    expect(typeMap['Post'].name).toEqual(PostType.name);
    expect(typeMap['Post'].fields).toEqual(PostType.fields);
    expect(typeMap['PostPage'].name).toEqual(PostPageType.name);
    expect(typeMap['PostPage'].fields).toEqual(PostPageType.fields);
    expect(typeMap['User'].name).toEqual(UserType.name);
    expect(typeMap['User'].fields).toEqual(UserType.fields);
    expect(typeMap['UserPage'].name).toEqual(UserPageType.name);
    expect(typeMap['UserPage'].fields).toEqual(UserPageType.fields);
});

test('creates two query fields per data type', () => {
    const queries = getSchemaFromData(data).getQueryType().getFields();
    expect(queries['Post'].type.name).toEqual(PostType.name);
    expect(queries['Post'].args).toEqual([
        {
            defaultValue: undefined,
            description: null,
            name: 'id',
            type: new GraphQLNonNull(GraphQLID),
        },
    ]);
    expect(queries['allPosts'].type.name).toEqual(PostPageType.name);
    expect(queries['allPosts'].args).toEqual([
        {
            defaultValue: undefined,
            description: null,
            name: 'page',
            type: GraphQLInt,
        },
        {
            defaultValue: undefined,
            description: null,
            name: 'perPage',
            type: GraphQLInt,
        },
        {
            defaultValue: undefined,
            description: null,
            name: 'sortField',
            type: GraphQLString,
        },
        {
            defaultValue: undefined,
            description: null,
            name: 'sortOrder',
            type: GraphQLString,
        },
        {
            defaultValue: undefined,
            description: null,
            name: 'filter',
            type: GraphQLString,
        },
    ]);
    expect(queries['User'].type.name).toEqual(UserType.name);
    expect(queries['User'].args).toEqual([
        {
            defaultValue: undefined,
            description: null,
            name: 'id',
            type: new GraphQLNonNull(GraphQLID),
        },
    ]);
    expect(queries['allUsers'].type.name).toEqual(UserPageType.name);
    expect(queries['allUsers'].args).toEqual([
        {
            defaultValue: undefined,
            description: null,
            name: 'page',
            type: GraphQLInt,
        },
        {
            defaultValue: undefined,
            description: null,
            name: 'perPage',
            type: GraphQLInt,
        },
        {
            defaultValue: undefined,
            description: null,
            name: 'sortField',
            type: GraphQLString,
        },
        {
            defaultValue: undefined,
            description: null,
            name: 'sortOrder',
            type: GraphQLString,
        },
        {
            defaultValue: undefined,
            description: null,
            name: 'filter',
            type: GraphQLString,
        },
    ]);
});

test('creates three mutation fields per data type', () => {
    const mutations = getSchemaFromData(data).getMutationType().getFields();
    expect(mutations['createPost'].type.name).toEqual(PostType.name);
    expect(mutations['createPost'].args).toEqual([
        {
            defaultValue: undefined,
            description: null,
            name: 'data',
            type: GraphQLString,
        },
    ]);
    expect(mutations['updatePost'].type.name).toEqual(PostType.name);
    expect(mutations['updatePost'].args).toEqual([
        {
            defaultValue: undefined,
            description: null,
            name: 'data',
            type: GraphQLString,
        },
    ]);
    expect(mutations['removePost'].type.name).toEqual(GraphQLBoolean.name);
    expect(mutations['removePost'].args).toEqual([
        {
            defaultValue: undefined,
            description: null,
            name: 'id',
            type: new GraphQLNonNull(GraphQLID),
        },
    ]);
    expect(mutations['createUser'].type.name).toEqual(UserType.name);
    expect(mutations['createUser'].args).toEqual([
        {
            defaultValue: undefined,
            description: null,
            name: 'data',
            type: GraphQLString,
        },
    ]);
    expect(mutations['updateUser'].type.name).toEqual(UserType.name);
    expect(mutations['updateUser'].args).toEqual([
        {
            defaultValue: undefined,
            description: null,
            name: 'data',
            type: GraphQLString,
        },
    ]);
    expect(mutations['removeUser'].type.name).toEqual(GraphQLBoolean.name);
    expect(mutations['removeUser'].args).toEqual([
        {
            defaultValue: undefined,
            description: null,
            name: 'id',
            type: new GraphQLNonNull(GraphQLID),
        },
    ]);
});