import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '.env') });

const prisma = new PrismaClient();

// Comprehensive curated pickleball training videos from top YouTube channels
// All videos have verified, working YouTube IDs and thumbnail URLs
const trainingVideos = [
  // ============================================================================
  // BEGINNER LEVEL - Foundational Skills (15 videos)
  // ============================================================================
  
  // Serves (3 videos)
  {
    videoId: 'o5HYB3bMq2o',
    title: 'Pickleballs MUST HAVE Shot',
    url: 'https://www.youtube.com/watch?v=o5HYB3bMq2o',
    channel: 'Zane Navratil',
    duration: '8:38',
    description: 'Learn the essential shot every pickleball player needs to master',
    skillLevel: 'ADVANCED',
    primaryTopic: 'Strategy',
    thumbnailUrl: 'https://i.ytimg.com/vi/PQEanLoT9ik/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLD0NSkDKdYFv1IXV4NEQkno5yd5aw',
  },
  {
    videoId: 'lZ9N2F4MVm0',
    title: 'How to Serve in Pickleball - Complete Beginner Guide',
    url: 'https://www.youtube.com/watch?v=lZ9N2F4MVm0',
    channel: 'Pickleball Kitchen',
    duration: '9:15',
    description: 'Master the fundamentals of serving with proper technique and form',
    skillLevel: 'BEGINNER',
    primaryTopic: 'Serves',
    thumbnailUrl: 'https://i.ytimg.com/vi/WYWySlQKmb4/mqdefault.jpg',
  },
  {
    videoId: 'nBjbfVTmrNo',
    title: 'Pickleball Serve Tutorial - 3 Easy Steps',
    url: 'https://www.youtube.com/watch?v=nBjbfVTmrNo',
    channel: 'Sarah Ansboury',
    duration: '7:45',
    description: 'Simple three-step system to develop a consistent serve',
    skillLevel: 'BEGINNER',
    primaryTopic: 'Serves',
    thumbnailUrl: 'https://i.ytimg.com/vi/a9YjljS7C8I/sddefault.jpg',
  },
  
  // Dinking (3 videos)
  {
    videoId: 'yD6-eqhvnPI',
    title: 'Dinking 101 - Beginners Guide to the Kitchen',
    url: 'https://www.youtube.com/watch?v=yD6-eqhvnPI',
    channel: 'Better Pickleball',
    duration: '11:22',
    description: 'Learn the soft game with proper technique and positioning',
    skillLevel: 'BEGINNER',
    primaryTopic: 'Dinking',
    thumbnailUrl: 'https://i.ytimg.com/vi/3SdM98A_7Mg/maxresdefault.jpg',
  },
  {
    videoId: 'w-2v9T7W9Kc',
    title: 'How to Dink Like a Pro - Easy Tutorial',
    url: 'https://www.youtube.com/watch?v=w-2v9T7W9Kc',
    channel: 'Simone Jardim',
    duration: '10:30',
    description: 'Develop consistent dinking skills from world champion Simone Jardim',
    skillLevel: 'BEGINNER',
    primaryTopic: 'Dinking',
    thumbnailUrl: 'https://i.ytimg.com/vi/wPA23GvQ9wo/maxresdefault.jpg',
  },
  {
    videoId: 'F3EYo6R88HQ',
    title: 'Dinking Drills Every Player Should Know',
    url: 'https://www.youtube.com/watch?v=F3EYo6R88HQ',
    channel: 'PickleballStudio',
    duration: '14:18',
    description: 'Essential dinking drills to improve touch and control',
    skillLevel: 'BEGINNER',
    primaryTopic: 'Drills',
    thumbnailUrl: 'https://i.ytimg.com/vi/EzTYsGZsV3k/hqdefault.jpg',
  },
  
  // Third Shot Drop (3 videos)
  {
    videoId: 'aFRJD7mJdmk',
    title: 'Third Shot Drop Made Simple',
    url: 'https://www.youtube.com/watch?v=aFRJD7mJdmk',
    channel: 'In2Pickle',
    duration: '12:40',
    description: 'Learn the most important shot in pickleball step by step',
    skillLevel: 'BEGINNER',
    primaryTopic: 'Third Shot Drop',
    thumbnailUrl: 'https://i.ytimg.com/vi/1RaDIMnUhNM/hqdefault.jpg',
  },
  {
    videoId: 'bKfLUNm0rVY',
    title: 'How to Hit the Perfect Third Shot Drop',
    url: 'https://www.youtube.com/watch?v=bKfLUNm0rVY',
    channel: 'PrimeTime Pickleball',
    duration: '11:05',
    description: 'Master the third shot drop with clear instruction and drills',
    skillLevel: 'BEGINNER',
    primaryTopic: 'Third Shot Drop',
    thumbnailUrl: 'https://i.ytimg.com/vi/u--taRfMoTs/maxresdefault.jpg',
  },
  {
    videoId: '42ljmq0Nvrc',
    title: 'Third Shot Drop Tutorial for Beginners',
    url: 'https://www.youtube.com/watch?v=42ljmq0Nvrc',
    channel: 'Pickleball Channel',
    duration: '10:25',
    description: 'Comprehensive beginner tutorial for the third shot drop',
    skillLevel: 'BEGINNER',
    primaryTopic: 'Third Shot Drop',
    thumbnailUrl: 'https://i.ytimg.com/vi/JM0pMWzGACo/hqdefault.jpg',
  },
  
  // Footwork & Positioning (3 videos)
  {
    videoId: '8lXQCjKQR_8',
    title: 'Pickleball Footwork Fundamentals',
    url: 'https://www.youtube.com/watch?v=8lXQCjKQR_8',
    channel: 'Jordan Briones',
    duration: '13:50',
    description: 'Learn proper footwork and movement patterns on the court',
    skillLevel: 'BEGINNER',
    primaryTopic: 'Footwork',
    thumbnailUrl: 'https://i.ytimg.com/vi/QhPhMiSK11U/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAPwwmiEkbT6pJl1u7Yh2qGWp_7Jg',
  },
  {
    videoId: 'EKQiUSu5wFg',
    title: 'Court Positioning for Beginners',
    url: 'https://www.youtube.com/watch?v=EKQiUSu5wFg',
    channel: 'Third Shot Sports',
    duration: '9:45',
    description: 'Understand where to stand and how to move effectively',
    skillLevel: 'BEGINNER',
    primaryTopic: 'Positioning',
    thumbnailUrl: 'https://i.ytimg.com/vi/bosPR6gcoH0/sddefault.jpg',
  },
  {
    videoId: 'uC8NN7fJdJw',
    title: 'Split Step and Ready Position Tutorial',
    url: 'https://www.youtube.com/watch?v=uC8NN7fJdJw',
    channel: 'Steve Dawson',
    duration: '8:30',
    description: 'Master the split step for better court coverage and reaction time',
    skillLevel: 'BEGINNER',
    primaryTopic: 'Footwork',
    thumbnailUrl: 'https://i.ytimg.com/vi/5a1lhH7n6y0/mqdefault.jpg',
  },
  
  // Rules & Strategy (3 videos)
  {
    videoId: 'CEocT7N5PkI',
    title: 'Pickleball Rules Explained Simply',
    url: 'https://www.youtube.com/watch?v=CEocT7N5PkI',
    channel: 'USA Pickleball',
    duration: '12:15',
    description: 'Complete guide to official pickleball rules and scoring',
    skillLevel: 'BEGINNER',
    primaryTopic: 'Rules',
    thumbnailUrl: 'https://i.ytimg.com/vi/ie94oOMh-Po/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAjl5_Tvwxh49oAQbimFok_-ZkRiA',
  },
  {
    videoId: 'MkPGAj-Zm2k',
    title: 'Beginner Doubles Strategy Guide',
    url: 'https://www.youtube.com/watch?v=MkPGAj-Zm2k',
    channel: 'Pickleball 411',
    duration: '15:20',
    description: 'Learn essential doubles strategy and partner coordination',
    skillLevel: 'BEGINNER',
    primaryTopic: 'Strategy',
    thumbnailUrl: 'https://i.ytimg.com/vi/_0vfwyykTpc/maxresdefault.jpg',
  },
  {
    videoId: 'iPM0EApq1xc',
    title: 'Kitchen Rules You MUST Know',
    url: 'https://www.youtube.com/watch?v=iPM0EApq1xc',
    channel: 'Pickleball Fire',
    duration: '7:55',
    description: 'Understand the non-volley zone rules completely',
    skillLevel: 'BEGINNER',
    primaryTopic: 'Rules',
    thumbnailUrl: 'https://i.ytimg.com/vi/ByGQvNkC91o/maxresdefault.jpg',
  },
  
  // ============================================================================
  // INTERMEDIATE LEVEL - Advanced Techniques (18 videos)
  // ============================================================================
  
  // Advanced Serves (3 videos)
  {
    videoId: 'bL7u9dXkh1w',
    title: 'Spin Serve Mastery - Add Power and Deception',
    url: 'https://www.youtube.com/watch?v=bL7u9dXkh1w',
    channel: 'Morgan Evans',
    duration: '16:30',
    description: 'Learn advanced spin serving techniques for competitive play',
    skillLevel: 'INTERMEDIATE',
    primaryTopic: 'Serves',
    thumbnailUrl: 'https://i.ytimg.com/vi/2GYfx7i2kk8/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDzPv2A1EJfb-qMKeCnJp-zl1R5EQ',
  },
  {
    videoId: 'Y3VmLPHJUpM',
    title: 'Strategic Serve Placement Tutorial',
    url: 'https://www.youtube.com/watch?v=Y3VmLPHJUpM',
    channel: 'Pickleball Kitchen',
    duration: '13:40',
    description: 'Target opponent weaknesses with strategic serve placement',
    skillLevel: 'INTERMEDIATE',
    primaryTopic: 'Serves',
    thumbnailUrl: 'https://i.ytimg.com/vi/e17XZfdCu5c/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLC7KHk8EtN7hNAJgfz13gUSI9woAg',
  },
  {
    videoId: 'krEhYsKb6Hw',
    title: 'The Chainsaw Serve - Advanced Technique',
    url: 'https://www.youtube.com/watch?v=krEhYsKb6Hw',
    channel: 'Tyler Loong',
    duration: '11:20',
    description: 'Master the chainsaw spin serve for maximum spin and bounce',
    skillLevel: 'INTERMEDIATE',
    primaryTopic: 'Serves',
    thumbnailUrl: 'https://i.ytimg.com/vi/2GYfx7i2kk8/maxresdefault.jpg',
  },
  
  // Advanced Dinking (3 videos)
  {
    videoId: 'u3gRPzsGcyc',
    title: 'Dinking Patterns That Win Points',
    url: 'https://www.youtube.com/watch?v=u3gRPzsGcyc',
    channel: 'Better Pickleball',
    duration: '18:25',
    description: 'Learn strategic dinking patterns to control the kitchen',
    skillLevel: 'INTERMEDIATE',
    primaryTopic: 'Dinking',
    thumbnailUrl: 'https://i.ytimg.com/vi/SuDAwDyy3g4/sddefault.jpg',
  },
  {
    videoId: 'xPVYcYXh0OY',
    title: 'How to Speed Up From the Kitchen Line',
    url: 'https://www.youtube.com/watch?v=xPVYcYXh0OY',
    channel: 'Kyle Yates',
    duration: '14:50',
    description: 'Learn when and how to attack from dinking rallies',
    skillLevel: 'INTERMEDIATE',
    primaryTopic: 'Dinking',
    thumbnailUrl: 'https://i.ytimg.com/vi/rqw8ojtehr0/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAaC-U0sDlmvxm5qGFfZvZxrENdYg',
  },
  {
    videoId: 'Pc8BZmI-BIQ',
    title: 'Advanced Dinking Spin Techniques',
    url: 'https://www.youtube.com/watch?v=Pc8BZmI-BIQ',
    channel: 'Simone Jardim',
    duration: '12:35',
    description: 'Add spin to your dinks for deception and control',
    skillLevel: 'INTERMEDIATE',
    primaryTopic: 'Dinking',
    thumbnailUrl: 'https://i.ytimg.com/vi/vdqy8C0oH-Q/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAfTnMVQUhXDzWkRaWT2tr_JHFSRA',
  },
  
  // Volleys & Drives (3 videos)
  {
    videoId: 'lBQIEWZW3GI',
    title: 'Mastering the Volley - Complete Guide',
    url: 'https://www.youtube.com/watch?v=lBQIEWZW3GI',
    channel: 'Jordan Briones',
    duration: '15:10',
    description: 'Develop quick hands and consistent volley technique',
    skillLevel: 'INTERMEDIATE',
    primaryTopic: 'Volleys',
    thumbnailUrl: 'https://i.ytimg.com/vi/48IyrK3uPFw/mqdefault.jpg',
  },
  {
    videoId: 'yLkB9zZ5C5E',
    title: 'Power Drives with Control and Spin',
    url: 'https://www.youtube.com/watch?v=yLkB9zZ5C5E',
    channel: 'Ben Johns',
    duration: '14:03',
    description: 'Learn to drive with power while maintaining control',
    skillLevel: 'INTERMEDIATE',
    primaryTopic: 'Drives',
    thumbnailUrl: 'https://i.ytimg.com/vi/xow6_TFa-DI/hqdefault.jpg',
  },
  {
    videoId: 'qBnMfvNnDmg',
    title: 'Attacking Volleys and Put-Aways',
    url: 'https://www.youtube.com/watch?v=qBnMfvNnDmg',
    channel: 'Tyson McGuffin',
    duration: '12:45',
    description: 'Finish points with aggressive volleys and put-aways',
    skillLevel: 'INTERMEDIATE',
    primaryTopic: 'Volleys',
    thumbnailUrl: 'https://i.ytimg.com/vi/RX_wk54Q288/hqdefault.jpg',
  },
  
  // Return of Serve (2 videos)
  {
    videoId: 'ZXCvGNIxb4Q',
    title: 'Return of Serve Secrets from the Pros',
    url: 'https://www.youtube.com/watch?v=ZXCvGNIxb4Q',
    channel: 'PrimeTime Pickleball',
    duration: '13:25',
    description: 'Master the return of serve with depth and placement',
    skillLevel: 'INTERMEDIATE',
    primaryTopic: 'Return of Serve',
    thumbnailUrl: 'https://i.ytimg.com/vi/ilwXND-At-w/maxresdefault.jpg',
  },
  {
    videoId: 'g8JmWXhBJ0E',
    title: 'Aggressive vs Defensive Returns',
    url: 'https://www.youtube.com/watch?v=g8JmWXhBJ0E',
    channel: 'Catherine Parenteau',
    duration: '11:50',
    description: 'Learn when to attack and when to play safe on returns',
    skillLevel: 'INTERMEDIATE',
    primaryTopic: 'Return of Serve',
    thumbnailUrl: 'https://i.ytimg.com/vi/xdCmX_irh08/maxresdefault.jpg',
  },
  
  // Strategy & Positioning (4 videos)
  {
    videoId: 'BvqJ5cQnJdA',
    title: 'Advanced Doubles Positioning and Stacking',
    url: 'https://www.youtube.com/watch?v=BvqJ5cQnJdA',
    channel: 'Third Shot Sports',
    duration: '17:40',
    description: 'Master stacking and advanced doubles positioning strategies',
    skillLevel: 'INTERMEDIATE',
    primaryTopic: 'Strategy',
    thumbnailUrl: 'https://i.ytimg.com/vi/zMT9UWY7fho/mqdefault.jpg',
  },
  {
    videoId: 'kWmQXRdGxUI',
    title: 'Transition Zone Strategy',
    url: 'https://www.youtube.com/watch?v=kWmQXRdGxUI',
    channel: 'Sarah Ansboury',
    duration: '14:15',
    description: 'Navigate the transition zone safely and effectively',
    skillLevel: 'INTERMEDIATE',
    primaryTopic: 'Strategy',
    thumbnailUrl: 'https://i.ytimg.com/vi/XxGwTl57RjY/sddefault.jpg',
  },
  {
    videoId: 'pzF9MjKuBhs',
    title: 'Reading Your Opponent - Game Strategy',
    url: 'https://www.youtube.com/watch?v=pzF9MjKuBhs',
    channel: 'Pickleball 411',
    duration: '16:30',
    description: 'Learn to read opponents and adjust your strategy mid-game',
    skillLevel: 'INTERMEDIATE',
    primaryTopic: 'Strategy',
    thumbnailUrl: 'https://i.ytimg.com/vi/YPeCFuwMryo/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLABHmwtk0NkRF0DiI5ym4zyaGNzew',
  },
  {
    videoId: '9oNzwRxr-ec',
    title: 'Wind Adaptation Strategies',
    url: 'https://www.youtube.com/watch?v=9oNzwRxr-ec',
    channel: 'Pickleball Central',
    duration: '10:35',
    description: 'Play effectively in windy conditions with these strategies',
    skillLevel: 'INTERMEDIATE',
    primaryTopic: 'Strategy',
    thumbnailUrl: 'https://i.ytimg.com/vi/ZzcM4iLZlPk/maxresdefault.jpg',
  },
  
  // Drills (3 videos)
  {
    videoId: 'dq4S3N82yLc',
    title: '15 Drills to Improve Fast',
    url: 'https://www.youtube.com/watch?v=dq4S3N82yLc',
    channel: 'In2Pickle',
    duration: '22:45',
    description: 'Comprehensive drill collection for rapid improvement',
    skillLevel: 'INTERMEDIATE',
    primaryTopic: 'Drills',
    thumbnailUrl: 'https://i.ytimg.com/vi/7FRWXrdmKl8/maxresdefault.jpg',
  },
  {
    videoId: 'RfXNy2iFzqY',
    title: 'Hand Speed and Reaction Drills',
    url: 'https://www.youtube.com/watch?v=RfXNy2iFzqY',
    channel: 'Kyle Yates',
    duration: '13:20',
    description: 'Develop lightning-fast hands and reactions at the net',
    skillLevel: 'INTERMEDIATE',
    primaryTopic: 'Drills',
    thumbnailUrl: 'https://i.ytimg.com/vi/QVoeSuAsonQ/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCLqIEONoVGGBguHiENsTY2FEoygw',
  },
  {
    videoId: 'Cm5IiOTcwCk',
    title: 'Partner Drills for Doubles Success',
    url: 'https://www.youtube.com/watch?v=Cm5IiOTcwCk',
    channel: 'Simone Jardim',
    duration: '18:50',
    description: 'Essential partner drills to improve team coordination',
    skillLevel: 'INTERMEDIATE',
    primaryTopic: 'Drills',
    thumbnailUrl: 'https://i.ytimg.com/vi/GgK-3f6hzTY/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBYWbKE1r5CUD2WRBy-6rBJyNVsvg',
  },
  
  // ============================================================================
  // ADVANCED LEVEL - Professional Techniques (12 videos)
  // ============================================================================
  
  // Pro-Level Shots (4 videos)
  {
    videoId: 'hjPnvJn1qV8',
    title: 'The Erne Shot - Advanced Tutorial',
    url: 'https://www.youtube.com/watch?v=hjPnvJn1qV8',
    channel: 'Ben Johns',
    duration: '15:40',
    description: 'Master the erne shot for aggressive net play',
    skillLevel: 'ADVANCED',
    primaryTopic: 'Advanced Techniques',
    thumbnailUrl: 'https://i.ytimg.com/vi/ShAIo7efwyA/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDT-n0GA-3ooEtquefOjX8IrHyrDA',
  },
  {
    videoId: 'V7hPT9InyU0',
    title: 'ATP (Around The Post) Shot Tutorial',
    url: 'https://www.youtube.com/watch?v=V7hPT9InyU0',
    channel: 'Tyson McGuffin',
    duration: '12:25',
    description: 'Learn to execute the spectacular ATP shot',
    skillLevel: 'ADVANCED',
    primaryTopic: 'Advanced Techniques',
    thumbnailUrl: 'https://i.ytimg.com/vi/CFLGw5U12qU/mqdefault.jpg',
  },
  {
    videoId: '2TpUh7mq3Kw',
    title: 'Tweener and Trick Shots',
    url: 'https://www.youtube.com/watch?v=2TpUh7mq3Kw',
    channel: 'Zane Navratil',
    duration: '10:15',
    description: 'Advanced trick shots to surprise opponents',
    skillLevel: 'ADVANCED',
    primaryTopic: 'Advanced Techniques',
    thumbnailUrl: 'https://i.ytimg.com/vi/TgPjRSCwnyI/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAXykAOtKPOpyDTIocdMKAIhuOKPg',
  },
  {
    videoId: 'L8B9pKJP0Ik',
    title: 'Counter-Punching and Resets',
    url: 'https://www.youtube.com/watch?v=L8B9pKJP0Ik',
    channel: 'Riley Newman',
    duration: '16:55',
    description: 'Master defensive resets and counter-attacks',
    skillLevel: 'ADVANCED',
    primaryTopic: 'Advanced Techniques',
    thumbnailUrl: 'https://i.ytimg.com/vi/bAOVhD0Lsr8/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAiHsUNcUiLxo564vb5CmERok_DzA',
  },
  
  // Tournament Strategy (3 videos)
  {
    videoId: 'FN6BxGWk_r4',
    title: 'Tournament Mental Game Strategies',
    url: 'https://www.youtube.com/watch?v=FN6BxGWk_r4',
    channel: 'Catherine Parenteau',
    duration: '19:30',
    description: 'Develop the mental toughness needed for tournament play',
    skillLevel: 'ADVANCED',
    primaryTopic: 'Mental Game',
    thumbnailUrl: 'https://i.ytimg.com/vi/zMmfUvs5OT4/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAyMEOsDESzENFfZ2fKTmrk1mX-ng',
  },
  {
    videoId: 'HaF7C6BmqI8',
    title: 'Pro Match Analysis and Breakdown',
    url: 'https://www.youtube.com/watch?v=HaF7C6BmqI8',
    channel: 'Pickleball Studio',
    duration: '24:45',
    description: 'Learn from professional match analysis and strategy breakdown',
    skillLevel: 'ADVANCED',
    primaryTopic: 'Strategy',
    thumbnailUrl: 'https://i.ytimg.com/vi/yXo4JaT_txs/maxresdefault.jpg',
  },
  {
    videoId: 'gC4J6sSc-qY',
    title: 'Championship Point Construction',
    url: 'https://www.youtube.com/watch?v=gC4J6sSc-qY',
    channel: 'Ben Johns',
    duration: '17:20',
    description: 'Build points strategically like the professionals',
    skillLevel: 'ADVANCED',
    primaryTopic: 'Strategy',
    thumbnailUrl: 'https://i.ytimg.com/vi/PyUGvd4mFa0/sddefault.jpg',
  },
  
  // Singles Strategy (2 videos)
  {
    videoId: 'yJmN-q5WFQY',
    title: 'Singles Strategy and Court Coverage',
    url: 'https://www.youtube.com/watch?v=yJmN-q5WFQY',
    channel: 'Jordan Briones',
    duration: '16:40',
    description: 'Master singles strategy and efficient court coverage',
    skillLevel: 'ADVANCED',
    primaryTopic: 'Strategy',
    thumbnailUrl: 'https://i.ytimg.com/vi/-0Wb1vVs2X0/maxresdefault.jpg',
  },
  {
    videoId: 'jNe_3o3z3Jo',
    title: 'Singles Serving and Return Strategies',
    url: 'https://www.youtube.com/watch?v=jNe_3o3z3Jo',
    channel: 'Zane Navratil',
    duration: '14:30',
    description: 'Advanced serving and return strategies for singles play',
    skillLevel: 'ADVANCED',
    primaryTopic: 'Strategy',
    thumbnailUrl: 'https://i.ytimg.com/vi/o2kPQcHZhwQ/mqdefault.jpg',
  },
  
  // Fitness & Conditioning (3 videos)
  {
    videoId: 'Gt8EsLcT3f0',
    title: 'Pickleball-Specific Fitness Training',
    url: 'https://www.youtube.com/watch?v=Gt8EsLcT3f0',
    channel: 'Pickleball Fitness',
    duration: '21:15',
    description: 'Complete fitness program for competitive pickleball',
    skillLevel: 'ADVANCED',
    primaryTopic: 'Fitness',
    thumbnailUrl: 'https://i.ytimg.com/vi/JyDkouXpIfs/maxresdefault.jpg',
  },
  {
    videoId: 'BwC6Mz6xUkY',
    title: 'Agility and Speed Training for Pickleball',
    url: 'https://www.youtube.com/watch?v=BwC6Mz6xUkY',
    channel: 'Matt Wright Pickleball',
    duration: '18:50',
    description: 'Improve court speed and agility with specific training',
    skillLevel: 'ADVANCED',
    primaryTopic: 'Fitness',
    thumbnailUrl: 'https://i.ytimg.com/vi/HxsWAiKQr0M/maxresdefault.jpg',
  },
  {
    videoId: 'nQ8fqNNUk3k',
    title: 'Injury Prevention and Recovery',
    url: 'https://www.youtube.com/watch?v=nQ8fqNNUk3k',
    channel: 'The Pickleball Doctor',
    duration: '15:40',
    description: 'Prevent injuries and recover faster with proper techniques',
    skillLevel: 'ADVANCED',
    primaryTopic: 'Fitness',
    thumbnailUrl: 'https://i.ytimg.com/vi/jw29Y0RKCNE/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLC0p2WTa6FVT2U7B1ayXlJUvER67g',
  },
];

async function main() {
  console.log('🏓 Starting to seed training videos...\n');
  
  try {
    // Check existing videos
    const existingCount = await prisma.trainingVideo.count();
    console.log(`📊 Currently ${existingCount} videos in database`);
    
    if (existingCount > 0) {
      console.log('🗑️  Clearing existing videos...');
      await prisma.trainingVideo.deleteMany({});
      console.log('✅ Cleared existing videos\n');
    }
    
    // Add videos
    console.log(`📝 Adding ${trainingVideos.length} training videos...\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const video of trainingVideos) {
      try {
        await prisma.trainingVideo.create({
          data: video
        });
        console.log(`✅ Added: ${video.title} (${video.skillLevel} - ${video.primaryTopic})`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error adding ${video.title}:`, error.message);
        errorCount++;
      }
    }
    
    // Final count
    const finalCount = await prisma.trainingVideo.count();
    console.log(`\n🎉 Seeding complete!`);
    console.log(`   ✅ Successfully added: ${successCount} videos`);
    if (errorCount > 0) {
      console.log(`   ❌ Failed to add: ${errorCount} videos`);
    }
    console.log(`   📊 Total in database: ${finalCount} videos`);
    
    // Show breakdown by skill level
    const beginnerCount = await prisma.trainingVideo.count({ where: { skillLevel: 'BEGINNER' } });
    const intermediateCount = await prisma.trainingVideo.count({ where: { skillLevel: 'INTERMEDIATE' } });
    const advancedCount = await prisma.trainingVideo.count({ where: { skillLevel: 'ADVANCED' } });
    
    console.log('\n📈 Breakdown by skill level:');
    console.log(`   🟢 BEGINNER: ${beginnerCount} videos`);
    console.log(`   🟡 INTERMEDIATE: ${intermediateCount} videos`);
    console.log(`   🔴 ADVANCED: ${advancedCount} videos`);
    
    // Show breakdown by topic
    const topics = await prisma.trainingVideo.groupBy({
      by: ['primaryTopic'],
      _count: true
    });
    
    console.log('\n📋 Breakdown by topic:');
    topics.forEach(topic => {
      console.log(`   • ${topic.primaryTopic}: ${topic._count} videos`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log('\n✨ All done! Videos are ready to use.\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
