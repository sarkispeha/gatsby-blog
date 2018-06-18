const _ = require('lodash')
const Promise = require('bluebird')
const path = require('path')
const { createFilePath } = require('gatsby-source-filesystem')
const createPaginatedPages = require("gatsby-paginate")

exports.createPages = ({ graphql, boundActionCreators }) => {
  const { createPage } = boundActionCreators

  return new Promise((resolve, reject) => {
    const blogPost = path.resolve('./src/templates/blog-post.js')
    resolve(
      graphql(
        `
          {
            allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }, limit: 1000) {
              edges {
                node {
                  excerpt
                  fields {
                    slug
                  }
                  frontmatter {
                    path
                    title
                    date(formatString: "DD MMMM, YYYY")
                  }
                }
              }
            }
          }
        `
      ).then(result => {
        
        if (result.errors) {
          console.log(result.errors)
          reject(result.errors)
        }
        // Create blog posts pages.
        const posts = result.data.allMarkdownRemark.edges;

        createPaginatedPages({
          edges: posts,
          createPage: createPage,
          pageTemplate: "src/templates/index.js",
          pageLength: 3, // This is optional and defaults to 10 if not used
          pathPrefix: "", // This is optional and defaults to an empty string if not used
          context: {} // This is optional and defaults to an empty object if not used
        });

        

        _.each(posts, (post, index) => {
          const previous = index === posts.length - 1 ? null : posts[index + 1].node;
          const next = index === 0 ? null : posts[index - 1].node;

          createPage({
            // path: post.node.fields.slug,
            path: post.node.frontmatter.path,
            component: blogPost,
            context: {
              slug: post.node.fields.slug,
              previous,
              next,
            },
          })
        })
      })
    )
  })
}

exports.onCreateNode = ({ node, boundActionCreators, getNode }) => {
  const { createNodeField } = boundActionCreators

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode })
    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}
