import path from "path";
import fs from "fs";
import UserManager from "./userManager.js";

const USER = new UserManager();

export default class MatchManager {

   // Constructor
    constructor() {
        this.path = path.join("./src/database/partidos.json");
    }

    // Metodos Privados
    #idGenerator = (matches) => {
        let idMayor = 0;
        matches.forEach(match => {
            if (match.id > idMayor) {
                idMayor = match.id;
            }
        });
        return idMayor + 1;
    };

    #readMatches = async () => {
        await this.#ensureFileExists();
        const response = await fs.promises.readFile(this.path, "utf8");
        return JSON.parse(response);
    };

    #writeFile = async (data) => {
        return await fs.promises.writeFile(this.path, JSON.stringify(data, null, "\t")); // Escribir los productos combinados en el archivo
    };

    #identifyId = async (id) => {
        const response = await this.#readMatches();
        const matchId = response.find(match => match.id === id);
        return matchId;
    };

    #ensureFileExists = async () => {
        try {
            await fs.promises.access(this.path, fs.constants.F_OK);
        } catch (error) {
            await this.#writeFile([]);
        }
    };

    // Metodos Públicos
    addMatch = async (hour, time, category, court, users) => {
        await this.#ensureFileExists();
        let matches = await this.#readMatches();

        const match = {
            id: this.#idGenerator(matches),
            hour,
            time,
            category,
            court,
            users: users = []
        }
        if(!hour || !time || !category || !court){
            return "Faltan Datos"
        }
        // Verificar si ya existe un partido en la misma cancha a la misma hora
        const existingMatch = matches.find(m => m.hour === hour && m.court === court);
        if (existingMatch) {
            return "Ya existe un partido en esa hora y en ese campo";
        } 
        let allMatches = [...matches, match];
        await this.#writeFile(allMatches);
        return "Partido Agregado"
    };

    getMatchById = async (id) => {
        await this.#ensureFileExists();
        const response = await this.#identifyId(id);
        if(!response){
            return "Not Found"
        } else {
            return response
        }
    };

    deleteMatchById = async (id) => {
        await this.#ensureFileExists();
        let matches = await this.#readMatches();
        matches = matches.filter(match => match.id!== id);
        await this.#writeFile(matches);
        return "Pertido Eliminado";
    };

    updateMatch = async ({ id, ...match }) => {
        await this.#ensureFileExists();
        const existingMatch = await this.#identifyId(id);
        if (existingMatch) {
            let matches = await this.#readMatches();
            matches = matches.map(p => p.id === id ? { id, ...match } : p);
            await this.#writeFile(matches);
            return "Partido Modificado";
        } else {
            return "Partido no encontrado";
        }
    };

    addUserToMatch = async (matchId, userId) => {
        await this.#ensureFileExists(); // Asegura que el archivo exista antes de cualquier operación
        try {
            let matchById = await this.getMatchById(matchId);
            let userById = await USER.getUserById(userId);
    
            if (!matchById) {
                return "Partido no encontrado";
            }
    
            if (!userById) {
                return "Usuario no encontrado";
            }
    
            let matches = await this.#readMatches();
            const matchIndex = matches.findIndex(match => match.id === matchId);
            const userIndex = matches[matchIndex].users.findIndex(user => user.userId === userId);

            // Calcular la cantidad total de jugadores actuales
            const totalPlayers = matches[matchIndex].users.reduce((acc, user) => acc + user.cantidad, 0);
    
            if(totalPlayers < 4) {
                // Verificar si el usuario esta en la misma categoria
                if (matchById.category === userById.category || matchById.category === userById.category + 1) {
                    // Verificar si el usuario ya está registrado en otro partido a la misma hora
                    const userInOtherMatch = matches.some(match => match.hour === matchById.hour && match.users.some(user => user.userId === userId));
                    if (userInOtherMatch) {
                        return "El jugador ya está registrado en otro partido";
                    } else {
                        matches[matchIndex].users.push({ userId, cantidad: 1 });
                        await this.#writeFile(matches);
                        return "Jugador Agregado";
                    }
                } else {
                    return "El jugador no pertenece a la misma categoria";
                }
            } else {
                return "No se puede agregar mas de 4 jugadores";
            }
        } catch (error) {
            console.log(error.message);
            return "Error interno";
        }
    };

    getMatches = async () => {
        await this.#ensureFileExists();
        const matchs = await this.#readMatches();
        return matchs;
    };
}