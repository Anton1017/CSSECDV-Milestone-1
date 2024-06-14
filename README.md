# ANIMATRIX - CSSECDV Milestone 1

Animatrix is an online anime discussion forum web application initially created for the completion of the requirements of CCAPDEV - Web Application Development, and subsequently modified for the requirements of CSSECDV Milestone 1.

## Deployment Instructions

1. Clone the repository by using Git or Github Desktop
2. Run the npm command for installing the necessary libraries 
```bash
   npm install
```
3. Configure the localhost MySQL database by setting a root account for it as well as the password
4. Follow this [guide](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases-typescript-postgresql) for setting up the Prisma ORM *OR* run the script for the database schema located at "models\SQLSchema\AnimatrixSchema2.sql"
5. Run the MySQL script located in "models\SQLUser\animatrix-privileges.sql" using the root MySQL account, then copy-paste its "DATABASE_URL" within the comment to replace the root account within the .env file
6. Run the web application by running the following in the root directory:
```bash
   node index.js
```
