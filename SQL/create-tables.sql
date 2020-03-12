create table recipes(
   id VARCHAR(100) NOT NULL,
   name VARCHAR(100),
   attAuthor VARCHAR(100),
   attLink VARCHAR(500),
   cookTime VARCHAR(10),
   prepTime VARCHAR(10),
   images VARCHAR(500),
   instructions NVARCHAR(1000),
   notes NVARCHAR(1000),
   PRIMARY KEY ( id )
);

create table tags(
   id VARCHAR(100) NOT NULL,
   name VARCHAR(100),
   PRIMARY KEY ( id )
);

create table ingredients(
   id VARCHAR(100) NOT NULL,
   name VARCHAR(100),
   category VARCHAR(100),
   PRIMARY KEY ( id )
);

create table recipe2tags(
   recipeId VARCHAR(100),
   tagId VARCHAR(100)
);

create table recipeIngredient(
   amount VARCHAR(100),
   ingredient VARCHAR(250),
   recipeId VARCHAR(100),
   ingredientId VARCHAR(100)
);

CREATE TABLE recipeIngredients (
    id int NOT NULL AUTO_INCREMENT,
   ingredient VARCHAR(250),
   recipeId VARCHAR(100),
   ingredientId VARCHAR(100),
    PRIMARY KEY (id)
);


SELECT r.name, ri.amount, ri.ingredientId, i.category FROM recipes r
JOIN recipeIngredient ri on ri.recipeId = r.id
JOIN ingredients i on i.id = ri.ingredientId


        SELECT 
            r.id,
            ri.amount, 
            ri.ingredientId, 
            i.category,
            GROUP_CONCAT(t.id),
            ri.id as rId
        FROM recipes r
        JOIN recipeIngredients ri on ri.recipeId = r.id
        JOIN ingredients i on i.id = ri.ingredientId
        JOIN recipe2tags rt on rt.recipeId = r.id
        JOIN tags t on t.id = rt.tagId
        WHERE r.id = 'gravy'
        GROUP BY ri.id;
        
        
        
                SELECT 
            r.id,
            ri.amount, 
            ri.ingredientId,
            i.category,
            GROUP_CONCAT(t.id) as tags
        FROM recipes r
        JOIN recipeIngredient ri on ri.recipeId = r.id
        JOIN ingredients i on i.id = ri.ingredientId
        JOIN recipe2tags rt on rt.recipeId = r.id
        JOIN tags t on t.id = rt.tagId
        WHERE r.id = 'baked-ziti';
        
        
        
        
        SELECT 
            r.id,
            ri.amount, 
            ri.ingredientId,
            GROUP_CONCAT(t.id) as tags
        FROM recipes r
        JOIN recipeIngredients ri on ri.recipeId = r.id
        JOIN ingredients i on i.id = ri.ingredientId
        JOIN recipe2tags rt on rt.recipeId = r.id
        JOIN tags t on t.id = rt.tagId
        GROUP BY ri.id;
        
GRANT ALL PRIVILEGES ON *.* TO 'recipeDBService'@'%' IDENTIFIED BY 'Pa$$w0rd' WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON *.* TO 'recipeDBService'@'%';
create user 'recipeDBService' identified by 'Pa$$w0rd';

GRANT ALL PRIVILEGES
ON *.*
TO 'recipeDBService'@'%'
IDENTIFIED BY 'Pa$$w0rd';
        
        
        
CREATE USER 'recipeDBService'@'localhost' IDENTIFIED BY 'Pa$$w0rd';
GRANT ALL PRIVILEGES ON *.* TO 'recipeDBService'@'localhost' WITH GRANT OPTION;
CREATE USER 'recipeDBService'@'vScopeServerIP' IDENTIFIED BY 'Pa$$w0rd';
GRANT ALL PRIVILEGES ON *.* TO 'recipeDBService'@'174.126.85.79' WITH GRANT OPTION;
FLUSH PRIVILEGES;






SELECT 
    r.id,
    r.name, 
    r.images,
    ri.amount, 
    ri.ingredientId,
    i.category
FROM recipes r
JOIN recipeIngredients ri on ri.recipeId = r.id
JOIN ingredients i on i.id = ri.ingredientId
WHERE r.id IN ('baked-ziti','gravy');


SELECT 
    r.id,
    r.name,
    r.attAuthor as author,
    r.images,
    ri.amount, 
    ri.ingredientId,
    i.category
FROM recipes r
JOIN recipeIngredients ri on ri.recipeId = r.id
JOIN ingredients i on i.id = ri.ingredientId
WHERE r.id IN ('baked-ziti','gravy');
















