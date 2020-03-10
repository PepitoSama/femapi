Documentation API

Authentification :

Login, POST
/api/user/login
Body :
{
	"username": "...", // Min 6, Max 255, required
	"password": "..."  // Min 6, Max 255, required
}

Response :
Status 400 : { error: 'Authentification failed' } if bad logs
Status 200 : {} if good logs, with token in header
Status 500 : { error: 'Internal Server Error' }
________________________________________________________________________
Register, POST
/api/user/register
Body :
{
    "username": "...", // Min 6, Max 255, required
    "password": "...", // Min 6, Max 255, required
    "email": "..."     // Min 6, Max 320, required
}

Response :
Status 400 : { error: 'Email Already taken !' }
Status 400 : { error: 'Username Already taken !' }
Status 400 : { error: 'Bad input' }
Status 201 : { id: ..., username: ...}
Status 500 : { error: 'Internal Server Error' }
________________________________________________________________________
________________________________________________________________________

Remark :

Get all Remarks, GET
/api/remark

Response
Status 200 : All remarks in JSON
Status 500 : { error: 'Internal Server Error' }
________________________________________________________________________
Post a new Remark, POST
/api/remark

Header :
auth-token : ...

Body:
{
	"content": "Blablablablabla"
}

Response :
Status 201 : { id : ... }
Status 400 : { error: 'Validation error' }
Status 401 : { error: 'You must be connected !' }
Status 500 : { error: 'Internal Server Error' }
________________________________________________________________________
Modify an existing remark, PATCH
/api/remark/:id

Header :
auth-token : ...

Body :
{
	"content" : "blablablabla"
}

Response :
Status 200 : { id: ..., content: ... }
Status 400 : { error: 'Validation error' }
Status 401 : { error: 'You don\'t own this ressource' }
Status 401 : { error: 'You must be connected !' }
Status 500 : { error: 'Internal Server Error' }
________________________________________________________________________
Delete an existing remark, DELETE
/api/remark/:id

Header :
auth-token : ...

Response :
Status 200 : { message : 'Deleted !' }
Status 401 : { error: 'You must be connected !' }
Status 401 : { error: 'Ressource not owned or does not exist' }
Status 500 : { error: 'Internal Server Error' }
________________________________________________________________________
Post a Response to a Remark, POST
/api/remark/response/:id

Header :
auth-token : ...

{
	"content" : "C'est pas très gentil"
}

Response :
Status 201 : { id : ... }
Status 400 : { error: 'Validation error' }
Status 401 : { error: 'Ressource does not exist' }
Status 401 : { error: 'You must be connected !' }
Status 500 : { error: 'Internal Server Error' }
________________________________________________________________________
Like a Remark, POST
/api/remark/like/:id

Header :
auth-token : ...

Body:
{
	"value": true // true or false
}

Response :
Status 200 : { messsage : 'Unliked !', id: ...}
Status 201 : { messsage : 'Liked !', id: ...}
Status 400 : { error: 'Validation error' }
Status 401 : { error: 'Ressource does not exist' }
Status 417 : { error: 'Action already done' }
Status 401 : { error: 'You must be connected !' }
Status 500 : { error: 'Internal Server Error' }
________________________________________________________________________
Like a Response, POST
/api/remark/:idRemark/like/:idResponse

Header :
auth-token : ...

Body:
{
	"value": true // true or false
}

Response :
Status 200 : { messsage : 'Unliked !', idRemark: ..., idResponse: ... }
Status 201 : { messsage : 'Liked !', idRemark: ..., idResponse: ... }
Status 400 : { error: 'Validation error' }
Status 417 : { error: 'Action already done' }
Status 401 : { error: 'You must be connected !' }
Status 500 : { error: 'Internal Server Error' }
________________________________________________________________________