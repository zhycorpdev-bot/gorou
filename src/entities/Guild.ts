import { Snowflake } from "discord-api-types";
import { Column, Entity, ObjectID, ObjectIdColumn, PrimaryColumn } from "typeorm";
import { defaultPrefix } from "../config";

@Entity({ name: "guilds" })
export class GuildSetting {
    @ObjectIdColumn()
    public _id!: ObjectID;

    @PrimaryColumn("string")
    public guild!: Snowflake;

    @Column("string")
    public requesterChannel!: Snowflake|null;

    @Column("string")
    public requesterMessage!: Snowflake|null;

    @Column("string")
    public prefix = defaultPrefix;

    @Column({ type: "boolean", default: false, nullable: true })
    public dj_only = false;

    @Column({ type: "string", nullable: true })
    public dj_role: string|null = null;

    @Column({ type: "boolean", default: false, nullable: true })
    public duplicate_song = false;

    @Column({ type: "string", nullable: true })
    public max_queue!: number;

    @Column({ type: "string", default: 100, nullable: true })
    public default_volume = 100;

    @Column({ type: "boolean", default: false, nullable: true })
    public announce_song = false;
}
