# OAuth2orize app example

This app is an example to demonstrate how to make a simple oauth2 server provider with [OAuth2orize](https://github.com/jaredhanson/oauth2orize/).

## Installing (unix like way)
```bash
    $ mkdir ~/projects
    $ cd ~/projects
    $ git clone git@github.com:joaoneto/oauth2orize-example.git
    $ cd oauth2orize-example
    $ npm install
```

## DB setup
### Create a user:
    » use oauth2orize
    » db.users.insert({name: "Foo Bar", "email": "foo@example.com", password: "123"})
    » db.users.find()
    { "_id" : ObjectId("XXXXXXXXXXXXXXXXXXXXXXXX"), "name" : "Foo Bar", "email" : "foo@example.com", "password" : "123" }

### Create a client:
    » db.clients.insert({user_id: ObjectId("XXXXXXXXXXXXXXXXXXXXXXXX"), secret:"abc123", redirect_uri:"http://localhost:3000"})


## Edit `client_oauth.sh` ([gist](https://gist.github.com/joaoneto/5360269))
Change `CLIENT_ID="XXXXXXXXXXXXXXXXXXXXXXXX"`, replace X with your client_id.

## Init app
```bash
    $ node server
```

## Test
```bash
    $ ./client_oauth.sh
```

## [Contributors](https://github.com/joaoneto/oauth2orize-example/graphs/contributors)

## License

[The MIT License](http://opensource.org/licenses/MIT)
