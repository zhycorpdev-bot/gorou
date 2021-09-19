import { Snowflake } from "discord-api-types";
import { Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";
import { defaultPrefix } from "../config";

@Entity({ name: "guilds" })
export class GuildSetting {
    @ObjectIdColumn()
    public _id!: ObjectID;

    @Column("string")
    public guild!: Snowflake;

    @Column("string")
    public requesterChannel!: Snowflake|null;

    @Column("string")
    public requesterMessage!: Snowflake|null;

    @Column("string")
    public prefix = defaultPrefix;
}
