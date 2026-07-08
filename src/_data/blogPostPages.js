const getBlogPosts = require("./blogPosts");

module.exports = async function() {
  const posts = await getBlogPosts();
  return posts.filter((post) => post.hasBody);
};
