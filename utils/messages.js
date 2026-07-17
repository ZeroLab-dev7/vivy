/**
 * Centralized multi-variant message system for Vivy's personality.
 * Curated for a premium, clean, and professional UX writing tone.
 */

const intros = [
   "Hehe... ", "Hmm... ", "Oops... ", "Whoops! ", "Oh? ", "Ah... ", "Well... ", "Eep! ",
   "Nice try! ", "Almost! ", "Looks like... ", "Yay! ", "Woohoo! ", "Huh... "
];

function wrapPersonality(msg) {
   if (typeof msg !== 'string') return msg;

   // Apply a 20% chance of adding an intro, but skip if the message starts with an emoji or special character
   if (Math.random() < 0.20 && !msg.startsWith('<') && !msg.startsWith('<a:pink8:1337678972108148757>') && !msg.startsWith('🚧') && !msg.startsWith('⚠️')) {
      const intro = intros[Math.floor(Math.random() * intros.length)];

      // Prevent double prepending
      if (!intros.some(i => msg.startsWith(i.trim()))) {
         let rest = msg;
         if (intro.endsWith('... ') || intro.endsWith('! ') || intro.endsWith('? ')) {
            // Capitalize first letter of msg
            rest = msg.charAt(0).toUpperCase() + msg.slice(1);
         } else {
            // Lowercase first letter of msg
            rest = msg.charAt(0).toLowerCase() + msg.slice(1);
         }
         return `${intro}${rest}`;
      }
   }
   return msg;
}

function getRand(arr, ...args) {
   const item = arr[Math.floor(Math.random() * arr.length)];
   return typeof item === 'function' ? item(...args) : item;
}

const messages = {
   success: {
      saved: (serverName) => getRand([
         `Settings saved for **${serverName}**!`,
         `Changes applied for **${serverName}**.`,
         `Everything has been updated for **${serverName}**.`,
         `Done! Your settings for **${serverName}** are now live.`,
         `Done! Your settings are updated.`,
         `Settings updated for **${serverName}**. ✨`,
         `Configuration saved successfully.`
      ]),
      done: () => getRand([
         `Done!`,
         `All set!`,
         `Everything's ready.`,
         `Mission accomplished.`,
         `That went perfectly.`,
         `Completed successfully! ✨`,
         `Done! ✨`,
         `All done!`
      ]),
      statusUpdated: () => getRand([
         `Status updated. ✨`,
         `Status updated successfully.`,
         `All set! Status updated.`,
         `Everything is updated.`,
         `Done! Status changes applied.`
      ]),
      general: () => getRand([
         `Done!`,
         `All set!`,
         `Everything's ready.`,
         `Mission accomplished.`,
         `That went perfectly.`,
         `Completed successfully! ✨`,
         `Done! ✨`,
         `All done!`
      ]),
      verified: () => getRand([
         `Verification successful! Welcome. <a:pink8:1337678972108148757>`,
         `You're verified! Ready to go. ✨`,
         `Verification complete.`,
         `All set! You've passed verification.`,
         `Verified! Go ahead and enjoy the server.`
      ]),
      prefixAdded: (prefix) => getRand([
         `Added prefix \`${prefix}\`. ✨`,
         `Got it! New prefix \`${prefix}\` is now active.`,
         `Prefix \`${prefix}\` added.`,
         `I have successfully added the prefix \`${prefix}\`.`,
         `Done! From now on, use \`${prefix}\`.`
      ]),
      prefixRemoved: (prefix) => getRand([
         `Removed prefix \`${prefix}\`.`,
         `Prefix \`${prefix}\` removed successfully.`,
         `Deleted prefix \`${prefix}\`.`,
         `I have removed the prefix \`${prefix}\`.`,
         `Done! The prefix \`${prefix}\` is gone.`
      ]),
      marriage: (user1, user2) => getRand([
         `Congratulations, **${user1}** and **${user2}**! You are now married! <:ring:1526494769050816512><a:pink8:1337678972108148757>`,
         `Best wishes to the happy couple, **${user1}** and **${user2}**! Married! <:ring:1526494769050816512>✨`,
         `Married! **${user1}** and **${user2}** are officially together. <:ring:1526494769050816512>`,
         `A beautiful match! **${user1}** and **${user2}** are now married. <:ring:1526494769050816512>`,
         `Two hearts join as one! Congrats to **${user1}** and **${user2}**! <:ring:1526494769050816512>`
      ]),
      divorce: (user1, user2) => getRand([
         `It's official. **${user1}** and **${user2}** have divorced. 💔`,
         `Divorced. **${user1}** and **${user2}** have parted ways. 💔`,
         `Marriage ended between **${user1}** and **${user2}**. 💔`,
         `Parted ways. **${user1}** and **${user2}** are now divorced. 💔`,
         `The family ties have been severed between **${user1}** and **${user2}**. 💔`
      ]),
      transfer: (amount, target) => getRand([
         `Transferred **$${amount}** to **${target}** successfully.`,
         `Sent **$${amount}** to **${target}**. ✨`,
         `Sent! **$${amount}** has been transferred to **${target}**.`,
         `Successfully sent **$${amount}** to **${target}**.`,
         `All done! **$${amount}** is on its way to **${target}**.`
      ]),
      lock: (channel) => getRand([
         `Locked **${channel}**. 🔒`,
         `Channel **${channel}** is now locked down. 🔒`,
         `Locked! Nobody can chat in **${channel}** for now.`,
         `Closed up! **${channel}** has been locked. 🔒`,
         `Lockdown enabled in **${channel}**.`
      ]),
      unlock: (channel) => getRand([
         `Unlocked **${channel}**. Let the chat resume! ✨`,
         `Channel **${channel}** is now unlocked. ✨`,
         `Unlocked **${channel}** successfully.`,
         `Lockdown lifted in **${channel}**. Go ahead and talk!`,
         `Open channel! **${channel}** is unlocked.`
      ]),
      roll: (val) => getRand([
         `🎲 You rolled a **${val}**!`,
         `🎲 Rolled a **${val}**!`,
         `🎲 The dice shows **${val}**.`,
         `🎲 You got a **${val}**!`,
         `🎲 A solid roll! It's a **${val}**.`
      ]),
      custom: (text) => text
   },
   error: {
      cooldown: (seconds) => getRand([
         `Easy there! You're moving a little too fast. Cooldown active for ${seconds}s.`,
         `Give it ${seconds}s before trying again.`,
         `Almost! Only ${seconds}s left.`,
         `Patience~ ${seconds}s to go.`,
         `You're still on cooldown. Wait another ${seconds}s.`,
         `Give my circuits a break! Wait ${seconds}s.`,
         `Hold on. Cooldown active for ${seconds}s. ⏳`
      ]),
      noPermission: (perm) => getRand([
         `You don't have permission to do that.` + (perm ? ` You need: \`${perm}\`` : ""),
         `Nice try, but that's not something you can use.` + (perm ? ` Missing: \`${perm}\`` : ""),
         `Looks like you're missing the required permission.` + (perm ? ` (\`${perm}\`)` : ""),
         `I can't let you do that without permission.` + (perm ? ` You need: \`${perm}\`` : ""),
         `You're missing a permission.` + (perm ? ` Required: \`${perm}\`` : ""),
         `Access denied.` + (perm ? ` You need the \`${perm}\` permission.` : ""),
         `That action is restricted.` + (perm ? ` Missing permission: \`${perm}\`.` : "")
      ]),
      botMissingPermissions: (perm) => getRand([
         `I can't do that without the required permission.` + (perm ? ` (\`${perm}\`)` : ""),
         `Looks like I'm missing a permission.` + (perm ? ` (\`${perm}\`)` : ""),
         `Give me a little more power and I'll handle it.` + (perm ? ` (I need: \`${perm}\`)` : ""),
         `Discord won't let me do that yet.` + (perm ? ` (Missing: \`${perm}\`)` : ""),
         `I need the ` + (perm ? `\`${perm}\`` : 'Administrator') + ` permission to do this.`,
         `Action failed. I am missing the \`${perm || 'required'}\` permission.`,
         `I don't have enough power. I need: \`${perm || 'required'}\`.`
      ]),
      invalidArguments: (usage) => getRand([
         `Invalid usage.` + (usage ? ` Correct format: \`${usage}\`` : ""),
         `Arguments invalid.` + (usage ? ` Usage: \`${usage}\`` : ""),
         `Incorrect arguments.` + (usage ? ` Try using: \`${usage}\`` : ""),
         `That's not how you use this command.` + (usage ? ` Try: \`${usage}\`` : ""),
         `Check your arguments.` + (usage ? ` Correct usage: \`${usage}\`` : "")
      ]),
      generic: () => getRand([
         `Something went wrong. Please try again.`,
         `An unexpected error occurred. Please try again.`,
         `Error executing action. Please try again.`,
         `Oops! Something didn't go quite right.`,
         `I hit a snag. Let's try that again.`
      ]),
      notFound: (item) => getRand([
         `${item ? item.charAt(0).toUpperCase() + item.slice(1) : 'Item'} not found.`,
         `Could not find specified ${item || 'item'}.`,
         `Specified ${item || 'thing'} does not exist.`,
         `I searched everywhere but couldn't find that ${item || 'item'}.`,
         `That ${item || 'item'} seems to be missing.`
      ]),
      guildNotFound: () => getRand([
         `Server not found. Please ensure I'm in that server.`,
         `Guild not found.`,
         `Could not locate the requested server.`,
         `That server doesn't seem to be in my records.`,
         `Hmm... I couldn't find the server.`
      ]),
      userNotFound: () => getRand([
         `I couldn't find that user.`,
         `I searched everywhere but couldn't find them.`,
         `That user seems to be hiding.`,
         `No luck—I couldn't find anyone matching that.`,
         `I couldn't find anyone by that name or ID.`,
         `Could not find that user. Check the ID or mention.`,
         `Hmm... that user doesn't seem to exist.`,
         `No user matches the details you provided.`
      ]),
      roleNotFound: () => getRand([
         `I couldn't find that role.`,
         `That role doesn't exist.`,
         `No role matched what you gave me.`,
         `Could not find the role in this server.`,
         `That role seems to have vanished.`,
         `Role not found. Check the spelling or ID.`,
         `No role matches the details you provided.`
      ]),
      channelNotFound: () => getRand([
         `I couldn't find that channel.`,
         `That channel doesn't seem to exist.`,
         `No channel matched that.`,
         `That channel is hiding from me.`,
         `Could not find the channel. Check the name or ID.`,
         `That channel doesn't exist in this server.`,
         `No channel matches the details you provided.`
      ]),
      alreadyExists: (item) => getRand([
         `That ${item || 'item'} already exists!`,
         `We already have one of those.`,
         `Specified ${item || 'item'} is already registered.`,
         `No need to add that again, it's already there!`,
         `It seems that ${item || 'item'} is already present.`
      ]),
      dbError: () => getRand([
         `Database error. Please try again shortly.`,
         `A temporary database issue occurred.`,
         `Database had a hiccup. Try again in a bit.`,
         `I couldn't read the database. Try again soon.`,
         `Database connection failed. Let's wait a moment.`
      ]),
      maintenance: (msg) => `🚧 Maintenance Mode Enabled\n\n${msg || "Vivy is currently undergoing maintenance.\nPlease try again later."}`,
      commandDisabled: (cmd) => `<:no:1526496561188831244>Command Disabled\n\nThe \`${cmd}\` command has been disabled globally by the developers.`,
      alreadyVerified: () => getRand([
         `Looks like you're already good to go.`,
         `Nothing to do—you're already verified.`,
         `All set! You've already passed verification.`,
         `You are already verified in this server.`,
         `Already verified! Go ahead and enjoy the server.`
      ]),
      verificationFailed: (reason) => `<:no:1526496561188831244>Verification Failed\n\nVerification failed: ${reason}`
   },
   verification: {
      success: () => getRand([
         `Verification successful! Welcome. <a:pink8:1337678972108148757>`,
         `You're verified! Ready to go. ✨`,
         `Verification complete.`,
         `All set! You've passed verification.`,
         `Verified! Go ahead and enjoy the server.`
      ]),
      failed: (reason) => getRand([
         `Verification failed: ${reason}`,
         `Ouch, verification failed: ${reason}`,
         `Verification unsuccessful: ${reason}`
      ]),
      alreadyVerified: () => getRand([
         `Looks like you're already good to go.`,
         `Nothing to do—you're already verified.`,
         `All set! You've already passed verification.`,
         `You are already verified in this server.`,
         `Already verified! Go ahead and enjoy the server.`
      ]),
      captchaChallengeMath: (num1, num2) => `To verify, please answer this simple question:\n\n**What is ${num1} + ${num2}?**`,
      captchaChallengeButton: (option) => `To verify, please click the button that matches:\n\n**${option}**`,
      verifyPrompt: () => `Click the button below to verify and get access to the server!`,
      pending: () => `Your verification is currently pending review by the staff.`
   },
   music: {
      queueAdded: (track) => `🎵 Added **${track}** to the queue.`,
      playing: (track) => `🎵 Now playing: **${track}**`,
      stopped: () => `Music stopped and queue cleared.`,
      paused: () => `Music paused. ⏸️`,
      resumed: () => `Music resumed. ▶️`,
      skipped: () => `Skipped to the next track.`,
      volumeChanged: (vol) => `Volume set to **${vol}%**. 🔊`,
      noActiveQueue: () => `No active music queue right now.`
   },
   ticket: {
      created: (channel) => `Ticket created at ${channel}.`,
      claimed: (member) => `👋 **Hello!** ${member} has claimed your request and will be with you shortly.`,
      closed: (member) => `<:no:1526496561188831244>**Closed by:** ${member} | \`${member.id}\``,
      notClaimed: () => `This ticket hasn't been claimed yet.`
   },
   economy: {
      balance: (wallet, bank) => `Balance:\n\n**Wallet:** $${wallet}\n**Bank:** $${bank}`,
      selfBalance: (wallet, bank) => `Balance:\n\n**Wallet:** $${wallet}\n**Bank:** $${bank}`,
      dailyClaimed: (amount) => `Claimed daily reward of **$${amount}**!`,
      transferred: (amount, target) => `Sent **$${amount}** to **${target}** successfully.`
   },
   moderation: {
      ban: (tag, reason) => getRand([
         `Banned **${tag}**. Reason: *${reason}*`,
         `Goodbye, **${tag}**. Banned: *${reason}*`,
         `**${tag}** banned. Reason: *${reason}*`
      ]),
      unban: (tag) => getRand([
         `Unbanned **${tag}**.`,
         `**${tag}** unbanned successfully.`,
         `Removed ban for **${tag}**.`
      ]),
      kick: (tag, reason) => getRand([
         `Kicked **${tag}**. Reason: *${reason}*`,
         `**${tag}** kicked. Reason: *${reason}*`,
         `Removed **${tag}** from server. Reason: *${reason}*`
      ]),
      warn: (tag, reason) => getRand([
         `Warning issued to **${tag}**. Reason: *${reason}* ⚠️`,
         `Warned **${tag}**. Reason: *${reason}* ⚠️`,
         `Warning logged for **${tag}**. Reason: *${reason}*`
      ]),
      unwarn: (tag) => getRand([
         `Warning removed from **${tag}**.`,
         `Unwarned **${tag}**.`,
         `Removed warning record for **${tag}**.`
      ]),
      mute: (tag, reason) => getRand([
         `Muted **${tag}**. Reason: *${reason}* 🤫`,
         `Muted **${tag}**. Silence is golden! Reason: *${reason}*`,
         `**${tag}** has been muted. Reason: *${reason}*`
      ]),
      unmute: (tag) => getRand([
         `Unmuted **${tag}**. You can talk now!`,
         `**${tag}** unmuted.`,
         `Removed mute for **${tag}**.`
      ]),
      jail: (tag, reason) => getRand([
         `Jailed **${tag}**. Reason: *${reason}* 🔒`,
         `**${tag}** jailed. Reason: *${reason}* 🔒`,
         `Locked up **${tag}**. Reason: *${reason}*`
      ]),
      unjail: (tag) => getRand([
         `Unjailed **${tag}**. Welcome back.`,
         `Released **${tag}** from jail.`,
         `Unjailed **${tag}**.`
      ]),
      timeout: (tag, duration, reason) => getRand([
         `Timed out **${tag}** for ${duration}. Reason: *${reason}* ⏳`,
         `**${tag}** on timeout for ${duration}. Reason: *${reason}* ⏳`,
         `Placed **${tag}** on timeout for ${duration}.`
      ]),
      untimeout: (tag) => getRand([
         `Timeout removed for **${tag}**.`,
         `Untimed out **${tag}**.`,
         `**${tag}** is no longer on timeout.`
      ])
   },
   leveling: {
      rank: (xp, level, rankVal, nextXp) => `Level stats:\n\n**Level:** ${level}\n**XP:** ${xp}/${nextXp}\n**Rank:** #${rankVal}`,
      rewardAdded: (role, level) => `Added reward: Level **${level}** awards the **${role}** role.`,
      rewardRemoved: (role) => `Removed role reward for **${role}**.`,
      boostAdded: (multiplier, target) => `Applied a **${multiplier}x** XP boost to **${target}**.`,
      boostRemoved: () => `XP boost removed.`
   },
   giveaway: {
      created: (prize, duration) => `<a:pink8:1337678972108148757> **GIVEAWAY CREATED** <a:pink8:1337678972108148757>\n\n**Prize:** ${prize}\n**Duration:** ${duration}\n\nReact to enter!`,
      ended: (winners, prize) => `<a:pink8:1337678972108148757> **GIVEAWAY ENDED** <a:pink8:1337678972108148757>\n\n**Winners:** ${winners}\n**Prize:** ${prize}`,
      joined: () => `Entered the giveaway successfully. Good luck! 🍀`,
      left: () => `You have left the giveaway.`,
      notEligible: () => `You are not eligible to enter this giveaway.`
   },
   security: {
      ownerSetup: (user) => `Registered **${user}** as the server owner.`,
      antilinkEnabled: () => `🛡️ Anti-Link enabled. Links are blocked.`,
      antilinkDisabled: () => `⚠️ Anti-Link disabled. Links are permitted.`,
      antibotsEnabled: () => `🛡️ Anti-Bot enabled. Third-party bots blocked.`,
      antibotsDisabled: () => `⚠️ Anti-Bot disabled. Third-party bots permitted.`,
      antiwebhookEnabled: () => `🛡️ Anti-Webhook enabled. Webhook creation blocked.`,
      antiwebhookDisabled: () => `⚠️ Anti-Webhook disabled.`,
      whitelistAdded: (entity) => `Added **${entity}** to whitelist.`,
      whitelistRemoved: (entity) => `Removed **${entity}** from whitelist.`
   },
   api: {
      accessDenied: "Access denied. You do not have access to this server.",
      manageServerRequired: "Access denied. You need the Manage Server permission to manage this server.",
      securityAdminDenied: "Access denied. Only server owners and bot developers can manage security and prefix settings."
   },
   validation: {
      USER_NOT_FOUND: (err) => {
         let msg = `I couldn't find that user.`;
         if (err && err.suggestion) {
            msg = `I couldn't find that user. Did you mean **${err.suggestion.nickname || err.suggestion.displayName || (err.suggestion.user && err.suggestion.user.username) || err.suggestion.username}**?`;
         }
         return msg;
      },
      ROLE_NOT_FOUND: (err) => {
         let msg = `I couldn't find that role.`;
         if (err && err.suggestion) {
            msg = `I couldn't find that role. Did you mean **@${err.suggestion.name}**?`;
         }
         return msg;
      },
      CHANNEL_NOT_FOUND: (err) => {
         let msg = `I couldn't find that channel.`;
         if (err && err.suggestion) {
            msg = `I couldn't find that channel. Did you mean **#${err.suggestion.name}**?`;
         }
         return msg;
      },
      CATEGORY_NOT_FOUND: () => `Category not found.`,
      VOICE_CHANNEL_NOT_FOUND: () => `Voice channel not found.`,
      MESSAGE_NOT_FOUND: () => `Message not found.`,
      INVALID_DURATION: () => `I couldn't understand that duration. Try something like \`10m\`, \`2h\`, or \`7d\`.`,
      INVALID_NUMBER: () => `That doesn't look like a number.`,
      INVALID_BOOLEAN: () => `Please provide a valid boolean (e.g. true/false, yes/no, enable/disable).`,
      INVALID_URL: () => `Hmm... that URL doesn't look valid.`,
      INVALID_COLOR: () => `Please provide a valid hex color or integer.`,
      MISSING_ARGUMENT: (err) => `Looks like you forgot to tell me the **${err.expected || 'argument'}**.`,
      WRONG_ENTITY_TYPE: (err) => {
         if (err.expected === 'user' && err.received === 'channel') {
            return `That's a channel... I need a user instead. 👀`;
         }
         if (err.expected === 'user' && err.received === 'role') {
            return `That looks like a role. I need a user instead! 😅`;
         }
         if (err.expected === 'user' && err.received === 'emoji') {
            return `That's an emoji... I'm looking for a user! 😅`;
         }
         if (err.expected === 'channel' && err.received === 'role') {
            return `Looks like that's a role. Please choose a channel instead.`;
         }
         if (err.expected === 'role' && err.received === 'emoji') {
            return `That's an emoji... I can't assign an emoji to someone! 😅`;
         }
         return `That looks like a **${err.received}**. I was expecting a **${err.expected}**.`;
      },
      MULTIPLE_MATCHES: (err) => `I found multiple matches: ${err.matches ? err.matches.join(', ') : ''}. Which one did you mean?`,

      selfPunish: () => getRand([
         `Planning to moderate yourself? That's... admirable.`,
         `I'd rather keep you around.`,
         `Nice try... but no.`
      ]),
      botPunish: () => getRand([
         `Hehe... I'd rather stay here and help.`,
         `If I disappear, who will take care of everyone?`,
         `I'd miss this server too much.`
      ]),
      ownerPunish: () => getRand([
         `Even I can't do that.`,
         `The server owner is off limits.`
      ]),
      adminProtection: () => getRand([
         `That member has higher permissions than I do.`,
         `Looks like they're protected by Discord's permission system.`,
         `I can't moderate someone with a role higher than or equal to yours.`
      ]),
      alreadyState: (action) => getRand([
         `Looks like that's already done.`,
         `Nothing to do here.`,
         `Seems that's already taken care of.`,
         `That is already in that state.`
      ]),

      // Camelcase aliases
      userNotFound: (err) => {
         let msg = `I couldn't find that user.`;
         if (err && err.suggestion) {
            msg = `I couldn't find that user. Did you mean **${err.suggestion.nickname || err.suggestion.displayName || (err.suggestion.user && err.suggestion.user.username) || err.suggestion.username}**?`;
         }
         return msg;
      },
      roleNotFound: (err) => {
         let msg = `I couldn't find that role.`;
         if (err && err.suggestion) {
            msg = `I couldn't find that role. Did you mean **@${err.suggestion.name}**?`;
         }
         return msg;
      },
      channelNotFound: (err) => {
         let msg = `I couldn't find that channel.`;
         if (err && err.suggestion) {
            msg = `I couldn't find that channel. Did you mean **#${err.suggestion.name}**?`;
         }
         return msg;
      },
      invalidDuration: () => `I couldn't understand that duration. Try something like \`10m\`, \`2h\`, or \`7d\`.`,
      invalidNumber: () => `That doesn't look like a number.`,
      wrongEntityType: (err) => `That looks like a **${err.received}**. I was expecting a **${err.expected}**.`,
      multipleMatches: (err) => `I found multiple matches: ${err.matches ? err.matches.join(', ') : ''}. Which one did you mean?`,
      missingArgument: (err) => `Looks like you forgot to tell me the **${err.expected || 'argument'}**.`
   }
};

// Create a recursive Proxy to wrap every returned string in wrapPersonality automatically.
function makeProxy(obj) {
   return new Proxy(obj, {
      get(target, prop, receiver) {
         const val = Reflect.get(target, prop, receiver);
         if (typeof val === 'function') {
            return function (...args) {
               const res = val.apply(this, args);
               return wrapPersonality(res);
            };
         }
         if (typeof val === 'object' && val !== null) {
            return makeProxy(val);
         }
         if (typeof val === 'string') {
            return wrapPersonality(val);
         }
         return val;
      }
   });
}

module.exports = makeProxy(messages);
