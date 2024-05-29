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
router.post('/rooms', async (req, res) => {
  const roomInitInfo = req.body;
  console.log('routes ', roomInitInfo.creator, roomInitInfo.numQuestions);
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
  const { roomKey, playerInfo } = req.body;

  try {
    const result = await Rooms.joinRoom(roomKey, playerInfo);
    return res.json(result);
  } catch (error) {
    return res.status(422).json({ error: error.message });
  }
});

// change room status - admin
router.patch('/rooms/:id', async (req, res) => {
  const roomId = req.params.id;
  const { status } = req.body;

  try {
    const result = await Rooms.changeStatus(roomId, status);
    return res.json(result);
  } catch (error) {
    return res.status(422).json({ error: error.message });
  }
});

router.post('/rooms/:id/submissions', async (req, res) => {
  const roomId = req.params.id;
  const { playerName, correct } = req.body;
  console.log('routes: ', playerName, correct);

  try {
    if (correct) {
      const result = await Rooms.addPoints(roomId, playerName);
      return res.json(result);
    } else {
      const result = await Rooms.resetPoints(roomId, playerName);
      return res.json(result);
    }
  } catch (error) {
    console.log('error: ', error.message);
    return res.status(422).json({ error: error.message });
  }
});

router.patch('/rooms/:id/players', async (req, res) => {
  const roomId = req.params.id;
  const { player, active } = req.body;

  try {
    const result = await Rooms.updatePlayerStatus(roomId, player, active);
    return res.json(result);
  } catch (error) {
    return res.status(422).json({ error: error.message });
  }
});

export default router;
