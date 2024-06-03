import path from "path";
import fs from "fs";

export default class UserManager {

   // Constructor
    constructor() {
        this.path = path.join("./src/database/users.json");
    }

    // Metodos Privados
    #idGenerator = (users) => {
        let idMayor = 0;
        users.forEach(user => {
            if (user.id > idMayor) {
                idMayor = user.id;
            }
        });
        return idMayor + 1;
    };

    #readUsers = async () => {
        await this.#ensureFileExists();
        const response = await fs.promises.readFile(this.path, "utf8");
        return JSON.parse(response);
    };

    #writeFile = async (data) => {
        return await fs.promises.writeFile(this.path, JSON.stringify(data, null, "\t")); // Escribir los productos combinados en el archivo
    };

    #validateEmail = (users, email) => {
        const validate = users.find(user => user.email === email);
        if(validate){
            console.log("El email ya existe");
        }
        return !validate;
    };

    #identifyId = async (id) => {
        const response = await this.#readUsers();
        const userId = response.find(user => user.id === id);
        return userId;
    };

    #ensureFileExists = async () => {
        try {
            await fs.promises.access(this.path, fs.constants.F_OK);
        } catch (error) {
            await this.#writeFile([]);
        }
    };

    // Metodos Públicos
    addUser = async (name, email, image, password, category) => {
        await this.#ensureFileExists();
        let users = await this.#readUsers();
        const newUser = {
            id: this.#idGenerator(users),
            name,
            email,
            image,
            password,
            category: category = "5ta",
            isAdmin: false
        };
        if (!name || !email || !image || !password) {
            console.log("Todos los campos son obligatorios");
        } else {
            if (this.#validateEmail(users, email)) {
                let userAdded = [...users, newUser];
                await this.#writeFile(userAdded);
                return "Usuario Agregado";
            }
        }
    };

    getUserById = async (id) => {
        await this.#ensureFileExists();
        const response = await this.#identifyId(id);
        if(!response){
            return "Not Found"
        } else {
            return response
        }
    };

    deleteUserById = async (id) => {
        await this.#ensureFileExists();
        let users = await this.#readUsers();
        users = users.filter(user => user.id !== id);
        await this.#writeFile(users);
        return "Usuario Eliminado";
    };

    updateUser = async ({ id, ...user }) => {
        await this.#ensureFileExists();
        const existingUser = await this.#identifyId(id);
        if (existingUser) {
            let users = await this.#readUsers();
            users = users.map(p => p.id === id ? { id, ...user } : p);
            await this.#writeFile(users);
            return "Usuario Modificado";
        } else {
            return "Usuario no encontrado";
        }
    };

    toggleIsAdmin = async (id) => {
        await this.#ensureFileExists();
        let users = await this.#readUsers();
        const index = users.findIndex(user => user.id === id);
        if (index === -1) {
            return "Usuario no encontrado";
        }
        users[index].isAdmin = !users[index].isAdmin;
        await this.#writeFile(users);
        return users[index];
    };

    getUsers = async () => {
        await this.#ensureFileExists();
        const users = await this.#readUsers();
        return users;
    };
}