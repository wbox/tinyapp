# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

# Login Page
!["Screenshot of Login page"](https://github.com/wbox/tinyapp/blob/master/docs/login.png)
!["Screenshot of URLs page"](https://github.com/wbox/tinyapp/blob/master/docs/urls-page.png)
!["Screenshot of Register page"](https://github.com/wbox/tinyapp/blob/master/docs/register-page.png)
!["screenshot of Creating a new TinyURL"](https://github.com/wbox/tinyapp/blob/master/docs/create-new-tinyurl.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session
- mocha
- chai

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `npm start` command.

## Important notes about the requirements

- After user logs out:
  - Its cookies must be deleted and,
  - it must beredirected to the /urls

This implementions redirect any request to /urls without cookies/user credentials to the login page.

