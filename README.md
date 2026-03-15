# SocialSync Deployment Guide for cPanel

SocialSync is a lightweight social network built with Node.js and Express. This guide will help you deploy it on a cPanel hosting environment.

## 1. Prepare Your Database
1. Log in to your cPanel.
2. Open **MySQL Database Wizard**.
3. Create a new database (e.g., `youruser_socialsync`).
4. Create a database user and assign it to the database with **All Privileges**.
5. Note down your **Database Name**, **Username**, and **Password**.
6. Open **phpMyAdmin**, select your database, and import the `schema.sql` file provided in the project root.

## 2. Upload Files
1. Compress your project folder (excluding `node_modules` and `database.sqlite`).
2. In cPanel, open **File Manager**.
3. Create a folder for your app (e.g., `/home/youruser/socialsync`).
4. Upload and extract your project files there.

## 3. Setup Node.js App in cPanel
1. In cPanel, search for **Setup Node.js App**.
2. Click **Create Application**.
3. **Node.js version**: Select 18.x or higher.
4. **Application mode**: Production.
5. **Application root**: `/home/youruser/socialsync`.
6. **Application URL**: Select your domain or subdomain.
7. **Application startup file**: `server.ts` (or `server.js` if you compile it).
   * *Note: If your cPanel doesn't support running `.ts` directly, you should build the project locally using `npm run build` and upload the `dist` folder and a compiled `server.js`.*

## 4. Configure Environment Variables
In the "Setup Node.js App" interface, add the following variables:
* `NODE_ENV`: `production`
* `DB_HOST`: `localhost`
* `DB_USER`: `youruser_dbuser`
* `DB_PASS`: `your_db_password`
* `DB_NAME`: `youruser_socialsync`
* `JWT_SECRET`: `a_long_random_string`

## 5. Install Dependencies
1. Scroll down to the "Configuration files" section.
2. Click **Run NPM Install**.

## 6. Porting from SQLite to MySQL
The current `src/db.ts` uses SQLite for demonstration. To use MySQL on cPanel:
1. Update `src/db.ts` to use `mysql2/promise`.
2. Example code for MySQL:
```javascript
import mysql from 'mysql2/promise';

export async function getDb() {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });
}
```

## 7. Restart the App
Click **Restart** in the Node.js App interface. Your site should now be live!
