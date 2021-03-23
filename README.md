# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Dependencies

- [Node.js](https://nodejs.org/en/)
- [Express](https://expressjs.com/)
- [EJS](https://ejs.co/)
- [bcrypt](https://www.npmjs.com/package/bcrypt)
- [body-parser](https://www.npmjs.com/package/body-parser)
- [cookie-session](https://expressjs.com/en/resources/middleware/cookie-session.html)
- [mocha](https://mochajs.org/)
- [chai](https://www.chaijs.com/)
- [bootstrap css](https://getbootstrap.com/docs/3.4/css/) (See head.ejs, urls_index.ejs files)

## Getting Started

### Installing the APP
- Clone this repo
- Install all dependencies (using the `npm install` command).
- Run the development web server using the `npm start` command.
- Open your browser and point to http://localhost:8080
- If you ran into any problems, please open an issue on the repo

### How to use the app
#### Add a new user
- Click on *Register* at the top of the page to create a new user by providing your email and password. The system doesn't accept duplicate emails in the database.
- After a new user has been created, it will be log in automatically.
#### List your URLS
- On the main screen at the top of the page you can list your urls by clicking on *My URLS*.
#### Create a new URL
- To create a new URL click on *Create New URL* and type the new URL. You will be redirected to a page with the new *shortULR* code that has been created and the new URL. Click on *Update* to complete the operation.
#### Delete a URL
- Click on *My URLs* and then on the *Delete* button.
#### Update a URL
- Click on *My URLS* and on the *Edit* button. A form with the URL information will load and you can update the information there and then click on the *Update* button.

## Final Product

### Login Page
!["Screenshot of Login page"](https://github.com/wbox/tinyapp/blob/master/docs/login.png)
### My URLs Page
!["Screenshot of URLs page"](https://github.com/wbox/tinyapp/blob/master/docs/urls-page.png)
### Register Page
!["Screenshot of Register page"](https://github.com/wbox/tinyapp/blob/master/docs/register-page.png)
### Create new URL page
!["screenshot of Creating a new TinyURL"](https://github.com/wbox/tinyapp/blob/master/docs/create-new-tinyurl.png)

## Application Requirements (REST)

To find the full description of the App requirements, please click [here](https://github.com/wbox/tinyapp/blob/master/system-requirements.md)

## Important notes about the requirements

- After user logs out:
  - Its cookies must be deleted and,
  - it must beredirected to the /urls

This implementions redirect any request to /urls without cookies/user credentials to the login page.


