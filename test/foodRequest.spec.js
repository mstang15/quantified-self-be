const chai = require('chai'); //require chai library
const should = chai.should(); //call should so we can use shoulda woulda matchers like capybara
const chaiHttp = require('chai-http'); //implement requests on server that we have locally
const server = require('../index'); // go out and reach into server file itself

const environment = process.env.NODE_ENV || 'development';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);

chai.use(chaiHttp);

describe('API Routes', () => {
  before((done) => {
  database.migrate.latest()
    .then(() => done())
    .catch(error => {
      throw error;
    });
  });

  beforeEach((done) => {
    database.seed.run()
      .then(() => done())
      .catch(error => {
        throw error;
      });
  });

  it('get /api/v1/foods should return id, name, calories', done => {
    chai.request(server)
    .get('/api/v1/foods')
    .end((err, response) => {
      response.should.have.status(200);
      response.body.should.be.a('array');
      response.body[0].should.have.property('id')
      response.body[0].should.have.property('name')
      response.body[0].should.have.property('calories')
      response.body[0].name.should.equal('bagel');
      response.body[0].calories.should.equal(250);
    });
    done();
  });

  it('get /api/v1/foods/:id should return single food with id, name, calories', done => {
    chai.request(server)
    .get('/api/v1/foods/1')
    .end((err, response) => {
      response.should.have.status(200);
      response.body.should.be.a('array');
      response.body[0].should.have.property('id')
      response.body.length.should.equal(1);
      response.body[0].should.have.property('name')
      response.body[0].should.have.property('calories')
      response.body[0].name.should.equal('bagel');
      response.body[0].calories.should.equal(250);
    });
    done();
  });

  it('delete /api/v1/foods/id should delete a food from db', done => {
    chai.request(server)
    .delete('/api/v1/foods/1')
    .end((err,response) => {
      response.should.have.status(500);
    });
    chai.request(server)
    .delete('/api/v1/foods/13')
    .end((err,response) => {
      response.should.have.status(204);
    })
    done();
  });

  it('post /api/v1/foods should return a 201 indicating the food has been added', done => {
    chai.request(server)
    .post('/api/v1/foods')
    .end((err, response) => {
      response.should.have.status(201);
      response.body.should.have.property('message')
      response.body.message.should.equal("Successfully added food item");
    });
    done();
  });

  it('patch /api/v1/foods/:id should return the updated item', done => {
    chai.request(server)
    .patch('/api/v1/foods/1')
    .send({
      food: {
        name: "milk",
        calories: 100
      }
    })
    .end((err,response) => {
      response.should.have.status(200);
      response.body[0].should.have.property('name');
      response.body[0].should.have.property('calories');
    })
    done();
  });
});


describe('API routes without seeds', () => {
  it('get api/v1/foods returns error if no foods seeded',done=>{
    chai.request(server)
    .get('api/v1/foods') //sad path because not seeded
    .end((err,response) => {
      response.should.have.status(404);
    });
    done();
  });
});
