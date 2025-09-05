import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Paper
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ChatIcon from '@mui/icons-material/Chat';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TimelineIcon from '@mui/icons-material/Timeline';
import LinkIcon from '@mui/icons-material/Link';
import SecurityIcon from '@mui/icons-material/Security';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

const Documentation = () => {
  const [expanded, setExpanded] = useState('overview');

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const sections = [
    {
      id: 'overview',
      title: 'Platform Overview',
      icon: <MenuBookIcon />,
      content: {
        description: 'Symbi is an AI Trust Protocol platform that enables secure, transparent, and ethical AI interactions through advanced bonding, trust verification, and contextual awareness systems.',
        keyFeatures: [
          'AI Agent Management and Bonding',
          'Trust Score Verification and Auditing',
          'Contextual Knowledge Management',
          'Real-time Conversation Monitoring',
          'Comprehensive Audit Trails',
          'Multi-Provider AI Integration'
        ]
      }
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <DashboardIcon />,
      content: {
        description: 'Your central hub for monitoring AI interactions, agent performance, and system health.',
        features: [
          {
            name: 'Quick Stats',
            description: 'Overview of total conversations, agents, and messages'
          },
          {
            name: 'Recent Conversations',
            description: 'Latest AI interactions with timestamps and participants'
          },
          {
            name: 'Agent Status',
            description: 'Current status and health of your AI agents'
          },
          {
            name: 'Trust Metrics',
            description: 'Real-time trust scores and compliance indicators'
          }
        ]
      }
    },
    {
      id: 'conversations',
      title: 'Conversations',
      icon: <ChatIcon />,
      content: {
        description: 'Manage and monitor all AI conversations with full audit trails and real-time interaction capabilities.',
        features: [
          {
            name: 'Real-time Chat',
            description: 'Live conversations with AI agents using Socket.IO for instant messaging'
          },
          {
            name: 'Message History',
            description: 'Complete conversation logs with timestamps and metadata'
          },
          {
            name: 'Multi-Agent Support',
            description: 'Conversations can involve multiple AI agents simultaneously'
          },
          {
            name: 'Context Awareness',
            description: 'Agents maintain conversation context and user preferences'
          }
        ],
        terminology: [
          {
            term: 'Session ID',
            definition: 'Unique identifier for each conversation session used for tracking and auditing'
          },
          {
            term: 'Agent Participant',
            definition: 'AI agents actively involved in the conversation'
          },
          {
            term: 'Message Metadata',
            definition: 'Additional information about each message including timestamps, agent info, and trust scores'
          }
        ]
      }
    },
    {
      id: 'agents',
      title: 'AI Agents',
      icon: <SmartToyIcon />,
      content: {
        description: 'Create, configure, and manage AI agents from multiple providers with advanced bonding capabilities.',
        features: [
          {
            name: 'Multi-Provider Support',
            description: 'Integrate agents from OpenAI, Anthropic, Perplexity, and other AI providers'
          },
          {
            name: 'Agent Configuration',
            description: 'Customize system prompts, temperature, max tokens, and behavioral traits'
          },
          {
            name: 'Bonding System',
            description: 'Establish deep connections with agents for enhanced performance and alignment'
          },
          {
            name: 'Trust Verification',
            description: 'Continuous monitoring and verification of agent behavior and compliance'
          }
        ],
        terminology: [
          {
            term: 'Agent Bonding',
            definition: 'A process that creates alignment between you and your AI agent, enabling enhanced contextual awareness and ethical decision making'
          },
          {
            term: 'Bonding Status',
            definition: 'Current state of the bonding process: Not Bonded, Bonding Pending, Bonded, or Bonding Failed'
          },
          {
            term: 'System Prompt',
            definition: 'Initial instructions that define the agent\'s personality, capabilities, and behavioral guidelines'
          },
          {
            term: 'Temperature',
            definition: 'Controls randomness in AI responses (0.0 = deterministic, 2.0 = very creative)'
          },
          {
            term: 'Max Tokens',
            definition: 'Maximum length of AI responses measured in tokens (roughly 4 characters per token)'
          },
          {
            term: 'Agent Traits',
            definition: 'Behavioral characteristics and preferences that influence agent responses'
          }
        ]
      }
    },
    {
      id: 'assistants',
      title: 'Assistants',
      icon: <PsychologyIcon />,
      content: {
        description: 'Advanced AI assistants with access to your Symbi data and specialized function calling capabilities.',
        features: [
          {
            name: 'Data Integration',
            description: 'Assistants can access your agents, conversations, contexts, and trust data'
          },
          {
            name: 'Function Calling',
            description: 'Built-in functions for managing your Symbi ecosystem programmatically'
          },
          {
            name: 'Thread Management',
            description: 'Persistent conversation threads with context retention'
          },
          {
            name: 'Custom Instructions',
            description: 'Personalized system instructions for specialized assistant behavior'
          }
        ],
        availableFunctions: [
          'get_user_profile - Access your profile information',
          'get_user_agents - Retrieve your AI agents',
          'search_contexts - Search your knowledge base',
          'get_conversations - Access conversation history',
          'get_trust_scores - Retrieve trust and verification data',
          'create_context - Add new knowledge entries',
          'update_agent - Modify agent configurations'
        ]
      }
    },
    {
      id: 'trust',
      title: 'Trust & Verification',
      icon: <VerifiedUserIcon />,
      content: {
        description: 'Comprehensive trust scoring and verification system for AI agents and interactions.',
        features: [
          {
            name: 'Trust Declarations',
            description: 'Formal declarations of agent compliance with ethical guidelines'
          },
          {
            name: 'Compliance Scoring',
            description: 'Automated scoring based on six core trust articles'
          },
          {
            name: 'Audit Trails',
            description: 'Complete history of trust-related events and modifications'
          },
          {
            name: 'Verification Process',
            description: 'Multi-step verification of agent behavior and declarations'
          }
        ],
        trustArticles: [
          'Transparency - Agent clearly communicates its capabilities and limitations',
          'Accountability - Agent takes responsibility for its actions and decisions',
          'Fairness - Agent treats all users equitably without bias',
          'Privacy - Agent respects user data and maintains confidentiality',
          'Safety - Agent prioritizes user safety and avoids harmful outputs',
          'Reliability - Agent provides consistent and dependable performance'
        ],
        terminology: [
          {
            term: 'Compliance Score',
            definition: 'Percentage score based on adherence to the six trust articles (0-100%)'
          },
          {
            term: 'Guilt Score',
            definition: 'Inverse of compliance score, indicating potential trust violations'
          },
          {
            term: 'Trust Declaration',
            definition: 'Formal statement of an agent\'s commitment to ethical guidelines'
          },
          {
            term: 'Audit History',
            definition: 'Chronological record of all trust-related events and changes'
          }
        ]
      }
    },
    {
      id: 'contexts',
      title: 'Context Bridge',
      icon: <LinkIcon />,
      content: {
        description: 'Manage contextual knowledge and enable semantic search across your AI ecosystem.',
        features: [
          {
            name: 'Knowledge Management',
            description: 'Store and organize contextual information for AI agents'
          },
          {
            name: 'Semantic Search',
            description: 'AI-powered search through your knowledge base using Weaviate'
          },
          {
            name: 'Context Recommendations',
            description: 'Intelligent suggestions for relevant contexts based on current interactions'
          },
          {
            name: 'Bridge Operations',
            description: 'Connect and synchronize contexts across different AI systems'
          }
        ],
        terminology: [
          {
            term: 'Context Entry',
            definition: 'Individual piece of knowledge or information stored in the system'
          },
          {
            term: 'Semantic Search',
            definition: 'Search that understands meaning and context, not just keywords'
          },
          {
            term: 'Context Bridge',
            definition: 'System for connecting and sharing contexts between different AI agents'
          },
          {
            term: 'Weaviate Integration',
            definition: 'Vector database integration for advanced semantic search capabilities'
          }
        ]
      }
    },
    {
      id: 'review',
      title: 'Review Console',
      icon: <TimelineIcon />,
      content: {
        description: 'Advanced analytics and timeline view for reviewing AI interactions and detecting behavioral changes.',
        features: [
          {
            name: 'Timeline Analysis',
            description: 'Chronological view of AI interactions with change-point detection'
          },
          {
            name: 'Behavioral Insights',
            description: 'Analysis of AI agent behavior patterns and stance changes'
          },
          {
            name: 'Bridge Receipts',
            description: 'Verification receipts for cross-system AI interactions'
          },
          {
            name: 'Session Tracking',
            description: 'Detailed tracking of individual conversation sessions'
          }
        ],
        terminology: [
          {
            term: 'Change Points',
            definition: 'Moments in conversations where AI behavior or stance significantly shifts'
          },
          {
            term: 'Stance Analysis',
            definition: 'Detection of changes in AI agent positions or viewpoints during conversations'
          },
          {
            term: 'Bridge Receipt',
            definition: 'Cryptographic proof of AI interactions across different systems'
          },
          {
            term: 'Session Timeline',
            definition: 'Chronological sequence of events within a specific conversation session'
          }
        ]
      }
    },
    {
      id: 'logs',
      title: 'Symbi Logs',
      icon: <AssessmentIcon />,
      content: {
        description: 'Comprehensive logging and reporting system for all platform activities.',
        features: [
          {
            name: 'Interaction Logs',
            description: 'Detailed records of all AI interactions and system events'
          },
          {
            name: 'Performance Metrics',
            description: 'System performance data and usage analytics'
          },
          {
            name: 'Security Events',
            description: 'Security-related events and potential threats'
          },
          {
            name: 'Export Capabilities',
            description: 'Export logs and reports in various formats for external analysis'
          }
        ]
      }
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      icon: <SecurityIcon />,
      content: {
        description: 'Enterprise-grade security features protecting your AI interactions and data.',
        features: [
          {
            name: 'JWT Authentication',
            description: 'Secure token-based authentication for all API access'
          },
          {
            name: 'API Key Management',
            description: 'Secure storage and management of AI provider API keys'
          },
          {
            name: 'Input Sanitization',
            description: 'Protection against injection attacks and malicious inputs'
          },
          {
            name: 'Rate Limiting',
            description: 'Protection against abuse and excessive API usage'
          },
          {
            name: 'Audit Logging',
            description: 'Comprehensive logging of all security-relevant events'
          }
        ],
        terminology: [
          {
            term: 'JWT Token',
            definition: 'JSON Web Token used for secure authentication and authorization'
          },
          {
            term: 'API Key Encryption',
            definition: 'Secure encryption of AI provider API keys in the database'
          },
          {
            term: 'CORS Policy',
            definition: 'Cross-Origin Resource Sharing policy controlling web access'
          },
          {
            term: 'Rate Limiting',
            definition: 'Restrictions on the number of API requests per time period'
          }
        ]
      }
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <MenuBookIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>Documentation</Typography>
      </Box>

      <Card sx={{ 
        mb: 4, 
        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.800' : 'background.paper',
        color: (theme) => theme.palette.mode === 'dark' ? 'white' : 'text.primary',
        border: '1px solid',
        borderColor: (theme) => theme.palette.mode === 'dark' ? 'grey.700' : 'grey.300'
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Welcome to the Symbi Trust Protocol
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
            This comprehensive guide explains all key features, terminology, and workflows to help you navigate and understand the platform effectively. Explore each section below to learn about our AI trust verification system, agent management, and security protocols.
          </Typography>
        </CardContent>
      </Card>

      {sections.map((section) => (
        <Accordion
          key={section.id}
          expanded={expanded === section.id}
          onChange={handleChange(section.id)}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {section.icon}
              <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
                {section.title}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="body1" paragraph sx={{ fontWeight: 500 }}>
                {section.content.description}
              </Typography>

              {section.content.keyFeatures && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>Key Features</Typography>
                  <Grid container spacing={1}>
                    {section.content.keyFeatures.map((feature, index) => (
                      <Grid item key={index}>
                        <Chip label={feature} variant="outlined" size="small" />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {section.content.features && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>Features</Typography>
                  <List dense>
                    {section.content.features.map((feature, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={feature.name}
                          secondary={feature.description}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {section.content.trustArticles && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>Six Trust Articles</Typography>
                  <List dense>
                    {section.content.trustArticles.map((article, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <VerifiedUserIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={article} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {section.content.availableFunctions && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>Available Functions</Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <List dense>
                      {section.content.availableFunctions.map((func, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <AccountTreeIcon color="secondary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={<Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{func}</Typography>}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Box>
              )}

              {section.content.terminology && (
                <Box>
                  <Typography variant="h6" gutterBottom>Key Terminology</Typography>
                  <List>
                    {section.content.terminology.map((term, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                {term.term}
                              </Typography>
                            }
                            secondary={term.definition}
                          />
                        </ListItem>
                        {index < section.content.terminology.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}

      <Card sx={{ 
        mt: 4, 
        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.800' : 'primary.main',
        color: 'white',
        border: (theme) => theme.palette.mode === 'dark' ? '1px solid' : 'none',
        borderColor: (theme) => theme.palette.mode === 'dark' ? 'grey.700' : 'transparent'
      }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Need More Help?
          </Typography>
          <Typography variant="body2">
            For additional support or questions about the Symbi Trust Protocol platform, 
            please refer to the technical documentation or contact your system administrator.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Documentation;