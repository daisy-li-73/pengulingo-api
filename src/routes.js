/* eslint-disable linebreak-style */
import { Router } from 'express';
import * as Rooms from './controllers/room_controller';

const router = Router();
// here we set up handling of endpoints
// each route will talk to a controller and return a response

// default index route
router.get('/', (req, res) => {
  return res.json({ message: 'Welcome to the Pengulingo API!' });
});

// create a game - admin
router.post('/creategame', async (req, res) => {
  const roomInitInfo = req.body;
  try {
    const result = await Rooms.createRoom(roomInitInfo);
    return res.json(result);
  } catch (error) {
    return res.status(422).json({ error: error.message });
  }
});

// get gamestate for room
router.get('/rooms/:id', async (req, res) => {
  const roomId = req.params.id;

  // fill in try/catch that handles calling the appropriate Rooms function
  // returns a response, see `create a room` above
  try {
    const result = await Rooms.getState(roomId);
    return res.json(result);
  } catch (error) {
    return res.status(422).json({ error: error.message });
  }
});

// join a room
router.post('/rooms/:id', async (req, res) => {
  const roomId = req.params.id;
  const playerInfo = req.body;

  try {
    const result = await Rooms.joinRoom(roomId, playerInfo);
    return res.json(result);
  } catch (error) {
    return res.status(422).json({ error: error.message });
  }
});

// change room status - admin
router.patch('/rooms/:id', async (req, res) => {
  const roomId = req.params.id;
  const { roomKey, status } = req.body;

  try {
    const result = await Rooms.changeStatus(roomId, roomKey, status);
    return res.json(result);
  } catch (error) {
    return res.status(422).json({ error: error.message });
  }
});

export default router;
