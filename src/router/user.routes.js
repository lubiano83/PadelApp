import { Router } from "express";
import UserManager from "../controllers/userManager.js";

const userRouter  = Router();
const USER = new UserManager();

// Product Manager
userRouter.post('/', async (req, res) => {
    const {name, email, image, password, category} = req.body;
    return res.status(201).send(await USER.addUser(name, email, image, password, category));
});


userRouter.get('/', async (req, res) => {
    return res.status(200).send(await USER.getUsers());
});

userRouter.get('/:id', async (req, res) => {
    let id = Number(req.params.id);
    return res.status(200).send(await USER.getUserById(id));
});

userRouter.delete('/:id', async (req, res) => {
    let id = Number(req.params.id);
    return res.status(200).send(await USER.deleteUserById(id));
});

userRouter.put('/:id', async (req, res) => {
    let id = Number(req.params.id);
    const {name, email, image, password, category, isAdmin} = req.body;
    return res.status(200).send(await USER.updateUser({id, name, email, image, password, category, isAdmin}));
});

userRouter.put('/isAdmin/:id', async (req, res) => {
    let id = Number(req.params.id);
    const result = await USER.toggleIsAdmin(id);
    if (result.error) {
        return res.status(404).send(result);
    }
    return res.status(200).send(result);
});

export default userRouter;
