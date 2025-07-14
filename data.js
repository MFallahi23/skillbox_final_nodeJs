export const customDemoText = (username) => {
  return `
# Welcome **${username}** 🎉

This is a markdown note with various formatting examples:

## Headers

# H1
## H2
### H3

## Lists

- Item 1
- Item 2
  - Subitem A
  - Subitem B

## Code

\`\`\`js
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Links

[Google](https://google.com)

## Bold and Italic

**Bold**, _Italic_, or ***both***.

---

Enjoy using the app! 😊
  `;
};

export const SESSION_EXPIRATION_TIME = 1000 * 60 * 60;
