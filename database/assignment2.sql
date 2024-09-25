--
-- Databse: 'cse 340 project', .public schema
-- Assignment 2, Task1

-- 1.Insert data into public.account
INSERT INTO public.account (
	account_firstname,
	account_lastname,
	account_email,
	account_password
)
VALUES (
	'Tony',
	'Stark',
	'tony@starkent.com',
	'Iam1ronm@n'
)

-- 2.Update Tony Stark
UPDATE public.account
SET account_type = 'Admin'
WHERE account_id=1;

-- 3.Delete Tony Start
DELETE FROM public.account
WHERE account_id = 1;

-- 4.Modify 'GM Hummer' record
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_id = 10;

-- 5.Join inventory table and classification name field
SELECT 
	inv.inv_id,
	inv.inv_make,
	inv.inv_model,
	inv.classification_id,
	class.classification_name
FROM 
	public.inventory inv
INNER JOIN public.classification "class"
	ON inv.classification_id = class.classification_id
WHERE
	inv.classification_id = 2;

-- 6.Update 'inv_images' and 'inv_thumbnail' in inventory table
UPDATE
	public.inventory 
SET
	inv_image = REPLACE(inv_image, 'images', 'images/vehicles'),
	inv_thumbnail = REPLACE(inv_thumbnail, 'images', 'images/vehicles');


