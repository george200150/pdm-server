import Router from 'koa-router';
import plantStore from './store';
import { broadcast } from "../utils";

export const router = new Router();

router.get('/', async (ctx) => {
  const response = ctx.response;
  const username = ctx.state.user.username;
  console.log("User:" + username);
  response.body = await plantStore.find({ username }); // get all user's data
  response.status = 200; // ok
});

router.get('/:id', async (ctx) => {
  const username = ctx.state.user.username;
  const plant = await plantStore.findOne({ _id: ctx.params.id });
  const response = ctx.response;
  if (plant) { // fiecare user va avea plantele lui pe care le va putea vedea
    if (plant.username === username) { // USER IS THE OWNER OF THE PLANT
      response.body = plant;
      response.status = 200; // ok
    } else { // CANNOT VISUALISE OTHERS' DATA
      response.status = 403; // forbidden
    }
  } else { // plant is not there
    response.status = 404; // not found
  }
});

const createPlant = async (ctx, plant, response) => {
  try {
    const username = ctx.state.user.username;
    console.log("everything went ok with username")
    plant.username = username;
    response.body = await plantStore.insert(plant);
    console.log("PASSED response.body = await plantStore.insert(plant);")
    response.status = 201; // created
    broadcast(username, { type: 'created', payload: plant });
  } catch (err) {
    console.log("ERROR: " + err);
    response.body = { message: err.message };
    response.status = 400; // bad request
  }
};

router.post('/', async ctx => await createPlant(ctx, ctx.request.body, ctx.response));

router.put('/:id', async (ctx) => {
  const plant = ctx.request.body;
  const id = ctx.params.id;
  const cardId = plant._id;
  const response = ctx.response;
  if (cardId && cardId !== id) {
    response.body = { message: 'Param id and body _id should be the same' };
    response.status = 400; // bad request
    return;
  }
  if (!cardId) {
    await createPlant(ctx, plant, response);
  } else {
    const username = ctx.state.user.username;
    plant.username = username;
    const updatedCount = await plantStore.update({ _id: id }, plant);
    if (updatedCount === 1) {
      response.body = plant;
      response.status = 200; // ok
      broadcast(username, { type: 'updated', payload: plant });
    } else {
      response.body = { message: 'Resource no longer exists' };
      response.status = 405; // method not allowed
    }
  }
});

router.del('/:id', async (ctx) => {
  const username = ctx.state.user.username;
  const plant = await plantStore.findOne({ _id: ctx.params.id });
  if (plant && username !== plant.username) { // WRONG OWNER OF THE PLANT (no permission to delete others' plants)
    ctx.response.status = 403; // forbidden
  } else {
    await plantStore.remove({ _id: ctx.params.id });
    ctx.response.status = 204; // no content
  }
});
