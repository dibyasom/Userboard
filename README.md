# Reskill Task

### Run server locally.

```bash
# From root directory
docker-compose up
```

### Remote deployed link

- [Register](https://reskill.herokuapp.com/register)

- [Explore](https://reskill.herokuapp.com/register)
  - // IDEALLY this API should implement authentication layer, but for easy Proof-of-Concept of registered users, it's OPEN.

### Rate Limit to secure against DoS attacks
* Set to 100 requests in each window.
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
```

### Endpoint security.
Basic vulnerability protection with helmet npm-package.
### Tasks accomplished successfully.
* Users can provide email, fullname and an image file.
* NodeJs saves the email, fullname to Mongo and image to local fs.
* EXPLORE: endpoint allows user to see all registered users.

### API doc
Please let me know if an API documentation is reuired on Postmanm, I'd be happy to write one.