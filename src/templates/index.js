import React, { Component } from "react"
import Link from "gatsby-link"
import get from 'lodash/get'
import Helmet from 'react-helmet'

import Bio from '../components/Bio'
import { rhythm } from '../utils/typography'
import { log } from "util";

const NavLink = props => {
  if (!props.test) {
    return <Link to={props.url}>{props.text}</Link>;
  } else {
    return <span>{props.text}</span>;
  }
};
class IndexPage extends React.Component {


// const IndexPage = ({ data, pathContext }) => {
    render() {
        const { data, pathContext } = this.props; 
        const { group, index, first, last, pageCount } = pathContext;
        const previousUrl = index - 1 == 1 ? "" : (index - 1).toString();
        const nextUrl = (index + 1).toString();
        const siteTitle = get(this, 'props.data.site.siteMetadata.title')
        const { previous, next } = this.props.pathContext
        
        console.log('GROUP', group)
        console.log('PROPS', this.props)

        return (
            <div>
                <Helmet 
                    title={siteTitle}
                    link="/blog"
                />
                {/* <h1>{siteTitle}</h1> */}
                <Bio />


                {group.map(({ node }) => {
                    const title = get(node, 'frontmatter.title') || node.fields.slug
                    return(
                    <div key={node.fields.slug} className="blogListing">
                        <h3
                            style={{
                            marginBottom: rhythm(1 / 4),
                            }}
                        >
                            <Link style={{ boxShadow: 'none' }} to={node.frontmatter.path}>
                            {title}
                            </Link>
                        </h3>
                        <small>{node.frontmatter.date}</small>
                        <p dangerouslySetInnerHTML={{ __html: node.excerpt }} />
                    {/* <Link className="blogUrl" to={node.fields.slug}>
                        {node.frontmatter.title}
                    </Link> */}
                    </div>
                    )
                })}

                <ul
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    listStyle: 'none',
                    padding: 0,
                }}
                >
                {!pathContext.first && (
                    <li>
                        <div className="previousLink">
                            <NavLink test={first} url={previousUrl} text="← Go to Previous Page" />
                        </div>
                    </li>
                )}
                <h5>{pageCount} Pages</h5>
                {!pathContext.last && (
                    <li>
                        <div className="nextLink">
                            <NavLink test={last} url={nextUrl} text="Go to Next Page →" />
                        </div>
                    </li>
                )}
                </ul>

            </div>
        );
    }
};
export default IndexPage;

export const pageQuery = graphql`
  query IndexQuery {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      sort: { 
        fields: [frontmatter___date], 
        order: DESC
      }
      limit: 5
    ) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            date(formatString: "DD MMMM, YYYY")
            path
            title
          }
        }
      }
    }
  }
`