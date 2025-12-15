require("dotenv").config();
const path = require("path");
const { Client, GatewayIntentBits, Partials, Events, AttachmentBuilder } = require("discord.js");
const Canvas = require("canvas");
const http = require("http");

const PORT = process.env.PORT || 3000; // Render sets this automatically

http.createServer((res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Bot is running!");
}).listen(PORT, () => {
  console.log(`🌐 Server is listening on port ${PORT} (for Render)`);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildMember],
});

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// === Bot Ready ===
client.once("ready", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on(Events.GuildMemberAdd, async (member) => {
// PURPLER role ID
  const welcomeRoleId = "1389293606073929820"; 

  const role = member.guild.roles.cache.get(welcomeRoleId);
  if (!role) {
    console.warn("⚠️ Purpler role not found!");
    return;
  }

  try {
    await member.roles.add(role);
    console.log(`✅ Gave welcome role to ${member.user.tag}`);
  } catch (error) {
    console.error("❌ Failed to assign welcome role:", error);
  }


  //  Create welcome image
  const channel = member.guild.systemChannel; 
  if (!channel) return;

  const canvas = Canvas.createCanvas(960, 540);
  const ctx = canvas.getContext("2d");

 
  ctx.save();
  drawRoundedRect(ctx, 0, 0, canvas.width, canvas.height, 40);
  ctx.clip();

  const background = await Canvas.loadImage(path.join(__dirname, "background.jpeg"));
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  ctx.restore();

  // Avatar
  const avatar = await Canvas.loadImage(
    member.user.displayAvatarURL({ extension: "png", size: 256 })
  );

  const avatarX = 100;
  const avatarY = 120;
  const avatarSize = 250;

  ctx.save();
  ctx.beginPath();
  ctx.arc(
    avatarX + avatarSize / 2,
    avatarY + avatarSize / 2,
    avatarSize / 2,
    0,
    Math.PI * 2
  );
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
  ctx.restore();

  // Text
  ctx.shadowColor = "black";
  ctx.shadowBlur = 10;

  ctx.font = "32px ";
  ctx.fillStyle = "#D9D9D9";
  ctx.fillText("WELCOME", 420, 180);

  ctx.font = "bold 50px ";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(`${member.displayName}`, 420, 240);

  ctx.font = "bold 30px ";
  ctx.fillStyle = "#540FAE";
  ctx.fillText("PURPLER", 420, 300);

  // Send image
  const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), {
    name: "welcome.png",
  });

  channel.send({
    content: `Hey <@${member.id}> ! Welcome to the Purple Movement 💜`,
    files: [attachment],
  });
});

client.login(process.env.DISCORD_TOKEN);
