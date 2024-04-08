import sequelizer from "../../db/index.js";
import { DataTypes } from "sequelize";

const Unbond = sequelizer.define("cntunbond", {
    validator: {
        type: DataTypes.STRING,
    },
    amount: {
        type: DataTypes.STRING,
    },
    source: {
        type: DataTypes.STRING,
    },
});

export default Unbond;