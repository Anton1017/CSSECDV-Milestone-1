/* 
Run this script by using a root account

Copy this to the .env file:
DATABASE_URL="mysql://animatrix:%40dB72%29%28%21%40a8f%23B5b%2500eD859ee68d887acc65%23%252fce%2Aca5@localhost:3306/animatrix"
*/

CREATE USER 'animatrix'@'localhost' IDENTIFIED BY '@dB72)(!@a8f#B5b%00eD859ee68d887acc65#%2fce*ca5';

GRANT SELECT, INSERT ON animatrix.users TO 'animatrix'@'localhost';

GRANT SELECT, INSERT, UPDATE ON animatrix.userprofile TO 'animatrix'@'localhost';

GRANT SELECT, INSERT ON animatrix.postlikes TO 'animatrix'@'localhost';

GRANT SELECT, INSERT ON animatrix.commentlikes TO 'animatrix'@'localhost';

GRANT SELECT, INSERT, UPDATE ON animatrix.postcomments TO 'animatrix'@'localhost';

GRANT SELECT, INSERT, UPDATE ON animatrix.posts TO 'animatrix'@'localhost';