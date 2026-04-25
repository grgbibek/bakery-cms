# Bakery CMS Backend - Database Management

This directory contains the backend API and database management tools for the Bakery CMS.

## 🗄️ Database Migrations (Schema Changes)

We use `db-migrate` to track and deploy database schema changes (creating tables, adding columns, etc.). The history is stored in the `migrations` table in your database.

### 1. How to Generate a New Migration
When you need to change the database structure, follow these steps locally:

1.  **Create the script:**
    ```bash
    npm run migrate:create name-of-your-change
    ```
    *Example: `npm run migrate:create add-discount-to-products`*
2.  **Edit the file:**
    A new file will be created in the `migrations/` folder. Open it and add your SQL:
    ```javascript
    exports.up = function(db, callback) {
      // SQL to apply the change
      db.runSql("ALTER TABLE products ADD COLUMN discount DECIMAL(10,2) DEFAULT 0", callback);
    };

    exports.down = function(db, callback) {
      // SQL to undo the change
      db.runSql("ALTER TABLE products DROP COLUMN discount", callback);
    };
    ```
3.  **Test locally:**
    ```bash
    npm run migrate:up
    ```

### 2. How to Deploy Migrations to Namecheap
To apply your local schema changes to the production server:

1.  **Prepare the package:**
    Run your deploy script to bundle the new migration files:
    ```bash
    npm run prepare-deploy
    ```
2.  **Upload and Extract:**
    Upload the `deploy.zip` to your Namecheap File Manager and extract it.
3.  **Run Migrations on Prod:**
    Open the **Terminal** in your cPanel (or via SSH) and run:
    ```bash
    cd path/to/your/backend
    npm run migrate:up
    ```
    *`db-migrate` will automatically detect which scripts haven't been run in prod and execute only the new ones.*

---

## 🌱 Database Seeding (Sample Data)

Seeding is handled separately from schema changes. Use this to populate the database with initial categories, products, and content.

1.  **Configure Data:** Edit `seed_db.js` to update the sample products or content.
2.  **Run Seeder:**
    ```bash
    npm run seed-db
    ```
    > [!CAUTION]
    > **Seeding will clear existing products and categories.** Use it primarily for initial setup or in development.

---

## 🛠️ Essential Scripts
- `npm run migrate:up`: Applies all pending migrations.
- `npm run migrate:down`: Reverts the last migration.
- `npm run migrate:create <name>`: Generates a new migration template.
- `npm run seed-db`: Populates the database with sample data.
- `npm run init-db`: (Legacy) Initial database setup. Use migrations for updates.
