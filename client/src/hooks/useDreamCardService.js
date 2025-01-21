import { useCallback } from 'react';
import { useUuidCache } from './useUuidCache';
import DreamCard from '../models/DreamCard';
import TemplateLibrary from '../templates/templateLibrary';

/**
 * Hook for managing DreamCard data persistence
 * @param {Object} storage - Storage provider object
 */
export const useDreamCardService = (storage) => {
  const {
    get,
    save,
    remove,
    getAll,
    clearCache
  } = useUuidCache('cards', storage);  // Remove '' prefix since storage already has it

  // Get a DreamCard by UUID
  const getCard = useCallback(async (cardUuid) => {
    // Check template library first - this is synchronous
    const template = TemplateLibrary.getTemplate(cardUuid);
    if (template) {
      console.log('[useDreamCardService] Using template:', { cardUuid, template });
      return template;
    }

    // Not a template, load from storage
    console.log('[useDreamCardService] Loading from storage:', cardUuid);
    return get(cardUuid);
  }, [get]);

  // Save a DreamCard
  const saveCard = useCallback(async (card) => {
    // Don't save if it's a template source
    if (TemplateLibrary.hasTemplate(card.uuid)) {
      console.log('[useDreamCardService] Skip saving template source:', card.uuid);
      return card;
    }

    return save({
      ...card,
      uuid: card.cardUuid // normalize uuid field
    });
  }, [save]);

  // Delete a DreamCard
  const deleteCard = useCallback(async (cardUuid) => {
    await remove(cardUuid);
  }, [remove]);

  // Create a new DreamCard
  const createCard = useCallback(async (data) => {
    // Check if we should use a template
    if (data.templateUuid && TemplateLibrary.hasTemplate(data.templateUuid)) {
      const template = TemplateLibrary.getTemplate(data.templateUuid);
      if (template) {
        console.log('[useDreamCardService] Creating from template:', { templateUuid: data.templateUuid, template });
        return saveCard(template);
      }
    }

    // Create normal card
    const card = DreamCard.create(data);
    await saveCard(card); // Save immediately after creation
    return card;
  }, [saveCard]);

  // Get all cards
  const getAllCards = useCallback(async () => {
    return getAll();
  }, [getAll]);

  // Get cards by owner
  const getCardsByOwner = useCallback(async (ownerUuid) => {
    const cards = await getAll();
    return cards.filter(card => card.ownerUuid === ownerUuid);
  }, [getAll]);

  // Get cards by assignee
  const getCardsByAssignee = useCallback(async (assigneeUuid) => {
    const cards = await getAll();
    return cards.filter(card => card.assigneeUuids.includes(assigneeUuid));
  }, [getAll]);

  // Get cards by tag
  const getCardsByTag = useCallback(async (tag) => {
    const cards = await getAll();
    return cards.filter(card => card.tags.includes(tag));
  }, [getAll]);

  // Update a card
  const updateCard = useCallback(async (cardUuid, updates) => {
    const card = await getCard(cardUuid);
    if (!card) throw new Error('Card not found');
    
    const updatedCard = DreamCard.update(card, updates);
    return saveCard(updatedCard);
  }, [getCard, saveCard]);

  return {
    getCard,
    saveCard,
    deleteCard,
    createCard,
    getAllCards,
    getCardsByOwner,
    getCardsByAssignee,
    getCardsByTag,
    updateCard,
    clearCache
  };
};
