import { generateUuid } from '../utils/uuidUtils';
import React from 'react';

const DreamCard = {
  create: ({
    title,
    description = '',
    type = 'goal',
    status = 'active',
    priority = 'medium',
    creatorUuid,
    ownerUuid,
    dueDate = null,
    assigneeUuids = [],
    watcherUuids = [],
    tags = [],
    attachments = [],
    comments = [],
    customFields = {},
  } = {}) => ({
    cardUuid: generateUuid(),
    uuid: generateUuid(),
    title,
    description,
    type, // 'dream' | 'goal' | 'plan' | 'achieve'
    status, // 'active' | 'completed' | 'archived' | 'deleted'
    priority, // 'low' | 'medium' | 'high'
    progress: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
    dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    creatorUuid,
    ownerUuid,
    assigneeUuids,
    watcherUuids,
    tags,
    attachments,
    comments,
    customFields,
    metrics: {
      views: 0,
      shares: 0,
      comments: comments.length,
      reactions: {},
    },
    uiState: {
      isExpanded: false,
      lastViewedAt: null,
      style: {
        bgColor: null,
        fgColor: null,
        fontFamily: null,
        fontSize: null,
      },
    },
  }),

  update: (card, updates) => ({
    ...card,
    ...updates,
    updatedAt: new Date().toISOString(),
  }),

  setProgress: (card, progress) => DreamCard.update(card, {
    progress: Math.max(0, Math.min(100, progress)),
  }),

  addComment: (card, { authorUuid, content }) => DreamCard.update(card, {
    comments: [
      ...card.comments,
      {
        uuid: generateUuid(),
        authorUuid,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reactions: {},
      },
    ],
    metrics: {
      ...card.metrics,
      comments: card.comments.length + 1,
    },
  }),

  addAttachment: (card, { name, url, type, size }) => DreamCard.update(card, {
    attachments: [
      ...card.attachments,
      {
        uuid: generateUuid(),
        name,
        url,
        type,
        size,
        uploadedAt: new Date().toISOString(),
      },
    ],
  }),

  addTag: (card, tag) => DreamCard.update(card, {
    tags: [...new Set([...card.tags, tag])],
  }),

  removeTag: (card, tag) => DreamCard.update(card, {
    tags: card.tags.filter(t => t !== tag),
  }),

  setCustomField: (card, key, value) => DreamCard.update(card, {
    customFields: {
      ...card.customFields,
      [key]: value,
    },
  }),

  addAssignee: (card, assigneeUuid) => DreamCard.update(card, {
    assigneeUuids: [...new Set([...card.assigneeUuids, assigneeUuid])],
  }),

  removeAssignee: (card, assigneeUuid) => DreamCard.update(card, {
    assigneeUuids: card.assigneeUuids.filter(uuid => uuid !== assigneeUuid),
  }),

  addWatcher: (card, watcherUuid) => DreamCard.update(card, {
    watcherUuids: [...new Set([...card.watcherUuids, watcherUuid])],
  }),

  removeWatcher: (card, watcherUuid) => DreamCard.update(card, {
    watcherUuids: card.watcherUuids.filter(uuid => uuid !== watcherUuid),
  }),

  complete: (card) => DreamCard.update(card, {
    status: 'completed',
    completedAt: new Date().toISOString(),
    progress: 100,
  }),

  archive: (card) => DreamCard.update(card, {
    status: 'archived',
  }),

  delete: (card) => DreamCard.update(card, {
    status: 'deleted',
  }),

  updateUiState: (card, uiStateUpdates) => DreamCard.update(card, {
    uiState: {
      ...card.uiState,
      ...uiStateUpdates,
    },
  }),

  isValid: (card) => {
    if (!card || typeof card !== 'object') return false;
    const requiredFields = ['cardUuid', 'title', 'creatorUuid', 'ownerUuid'];
    return requiredFields.every(field => card[field]);
  },

  isValidType: (type) => ['dream', 'goal', 'plan', 'achieve'].includes(type),
  isValidStatus: (status) => ['active', 'completed', 'archived', 'deleted'].includes(status),
  isValidPriority: (priority) => ['low', 'medium', 'high'].includes(priority),
};

export default DreamCard;
