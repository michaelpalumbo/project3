const { User, ChordScribble } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');
const { Key } = require("@tonaljs/tonal");


const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user){
                const userData = await User.findOne({})
                    .select('-__v -password')
                    .populate('thoughts')
                    .populate('friends');
            
                return userData;
          }
        },
        
        // get all users
        users: async () => {
            return User.find()
            .select('-__v -password')
            .populate('friends')
            .populate('thoughts');
        },
        // get a user by username
        user: async (parent, { username }) => {
            return User.findOne({ username })
            .select('-__v -password')
            .populate('friends')
            .populate('thoughts');
        },
        chordTwoList: async (parent, {chord})=>{
            // user has selected this chord in drop-down menu 1
            chordname = chord.split(' ')[0]
            type = chord.split(' ')[1]
            
            switch(type){
                case "major":
                    keyInfo = Key.majorKey(chordname)
                    return JSON.stringify(keyInfo.chords)
                break
                case "minor":
                    keyInfo = Key.minorKey(chordname)
                    return JSON.stringify(keyInfo.natural.chords)
                break
            }     
        },
        getChordScribble : async (parent, {username,scribbleBox,chordName}) =>{

            return await ChordScribble.findOne({ username,scribbleBox,chordName });

        }

    },
    Mutation: {
        addUser: async (parent,args) => {
            const user = await User.create(args);
            const token = signToken(user);

             return { token, user };
        },
        login: async (parent,{ email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
              throw new AuthenticationError('Incorrect credentials');
            }
          
            const correctPw = await user.isCorrectPassword(password);
          
            if (!correctPw) {
              throw new AuthenticationError('Incorrect credentials');
            }
          
            const token = signToken(user);
            return { token, user };
        },
        chordScribble : async (parent, {username,scribbleText,scribbleBox,chordName}) =>{
           let newScribble 
            const chordScribble = await ChordScribble.findOne({ username,scribbleBox,chordName });
                if (chordScribble) {
                    // this chordScribble exists, therefore will update it 
                    newScribble = await ChordScribble.findOneAndUpdate({username,scribbleBox,chordName },{scribbleText: scribbleText},{new: true} )
                    
                }
                else {
                    // chordCribble doesn't exist yet, create it
                    newScribble = await ChordScribble.create({ username,scribbleText,scribbleBox,chordName });

                }
            
            
            
            return newScribble
        },
        
      }

};
  
module.exports = resolvers;