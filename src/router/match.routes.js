import { Router } from "express";
import MatchManager from "../controllers/MatchManager.js";

const matchRouter  = Router();
const MATCH = new MatchManager();

// Product Manager
matchRouter.post('/', async (req, res) => {
    const {hour, time, category, court} = req.body;
    return res.status(201).send(await MATCH.addMatch(hour, time, category, court));
});


matchRouter.get('/', async (req, res) => {
    return res.status(200).send(await MATCH.getMatches());
});

matchRouter.get('/:id', async (req, res) => {
    let id = Number(req.params.id);
    return res.status(200).send(await MATCH.getMatchById(id));
});

matchRouter.delete('/:id', async (req, res) => {
    let id = Number(req.params.id);
    return res.status(200).send(await MATCH.deleteMatchById(id));
});

matchRouter.put('/:id', async (req, res) => {
    let id = Number(req.params.id);
    const {hour, time, category, court} = req.body;
    return res.status(200).send(await MATCH.updateMatch({id, hour, time, category, court, players}));
});

matchRouter.post('/:mid/users/:uid', async (req, res) => {
    let matchId = Number(req.params.mid);
    let userId = Number(req.params.uid);
    res.status(200).send(await MATCH.addUserToMatch(matchId, userId));
});

export default matchRouter;
