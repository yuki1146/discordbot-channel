あconst { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');
const { token, clientId, guildId } = require('./config.json');

// Discordクライアントの作成
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// スラッシュコマンドのデプロイ
const commands = [
  new SlashCommandBuilder()
    .setName('channel')
    .setDescription('Manage channel')
    .addSubcommand(subcommand =>
      subcommand
        .setName('name')
        .setDescription('チャンネルの名前を変更します。')
        .addStringOption(option =>
          option.setName('text')
            .setDescription('何というチャンネル名にしますか？')
            .setRequired(true)))
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('アプリケーション（/）コマンドのリフレッシュを開始。');

    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands },
    );

    console.log('アプリケーション（/）コマンドのリロードに成功。');
  } catch (error) {
    console.error(error);
  }
})();

// Botが準備できた時に呼ばれるイベント
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === 'channel' && options.getSubcommand() === 'name') {
      // まず、インタラクションにすぐ応答する（遅延応答を通知）
      await interaction.deferReply({ ephemeral: true });

      try {
          const newChannelName = options.getString('text');
          await interaction.channel.setName(newChannelName);

          // 遅延応答を編集して結果を伝える
          await interaction.editReply(`チャンネル名を "${newChannelName}" に変更しました。`);
      } catch (error) {
          // エラー時の応答
          await interaction.editReply('チャンネル名の変更に失敗しました。権限が足りない可能性があります。');
      }
  }
});

// Discord Botにログイン
client.login(token);
