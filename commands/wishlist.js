const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const guildProfile = require('../schemas/guildSchema.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wishlist')
    .setDescription('Adds your wishlist to the wishlist channel (see https://docs.golemheart.io/commands/wishlist)')
    .addStringOption(option =>
      option
        .setName('link')
        .setDescription('Enter a link to your wishlist')
        .setRequired(true)),

  async execute(interaction, client) {

    //Check if wishlist url is on allowlist
    const wishlistURL = interaction.options.getString('link');
    const isDomainAllowed = client.isURLAllowed(wishlistURL);
    if (isDomainAllowed === false) {
      const allowedDomains = "```" + client.urlAllowlist.join("\n") + "```"
      await interaction.reply({ content: `GolemHeart supports wishlists from the following online deck builders:${allowedDomains}\nTo request support for a site, see here: <https://github.com/wise-io/GolemHeart/issues/25>`, ephemeral: true });
      return;
    }

    //Get wishlist channel from database
    let channel;
    const guildDBObject = await guildProfile.findById(interaction.guild.id).select('wishlistChannelID').exec();
    const channelID = guildDBObject.wishlistChannelID;
    if (channelID == undefined) {
      await interaction.reply({ content: 'The wishlist command has not been setup in this server. Please contact a server admin for assistance.', ephemeral: true });
      return;
    } else {
      channel = await client.channels.fetch(channelID);
    }

    //Create embed
    const embed = new MessageEmbed()
      .setColor('#6DE194')
      .setTitle(`${interaction.user.username}'s Wishlist`)
      .setDescription(`${wishlistURL}\n-----\n Please message ${interaction.user} directly if you would like to send them items on their wishlist. Thanks for making our community a great place!`)
      .setURL(wishlistURL)
      .setThumbnail(interaction.user.displayAvatarURL())
      .setFooter({ text: 'Please remember, this is for gifting purposes only.', iconURL: interaction.guild.iconURL() })

    //Send reply
    await channel.send({ embeds: [embed] });
    await interaction.reply({ content: `Your wishlist has been added to the ${channel} channel.`, ephemeral: true });
  },
};
