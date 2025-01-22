import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { 
  Calendar, 
  Clock, 
  User, 
  Users, 
  Tag,
  MessageSquare,
  Paperclip,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Eye,
  Share2
} from 'react-feather';
import { useDreamCardService } from '../../../hooks/useDreamCardService';
import { dreamStorage } from '../../../storage/genericStorage';
import DreamCardModel from '../../../models/DreamCard';
import { formatDateForDisplay } from '../../../utils/dateManager';
import './KanbanCard.css';
import PencilIcon from '../../Icons/PencilIcon';
import ProgressBarIcon from '../../Icons/ProgressBarIcon';

const POLL_INTERVAL = 8000;

const DreamCard = ({
  cardUuid,  
  card,
  onUpdate,
  onOpenModal,
  isDraggable = true,
  isSelected = false,
  onClick,
  onDragStart,
  onDragEnd,
  isNew = false,
  className = ''
}) => {
  // Refs for tracking fetch state - these don't trigger re-renders
  const fetchStateRef = useRef({
    isMounted: false, // Initialize as false
    isLoading: false,
    isUpdating: false,
    lastFetchTime: 0,
    updateTimer: null
  });

  // Set up mount state
  useEffect(() => {
    console.log(`[DreamCard] [${new Date().toISOString()}] Mounting:`, cardUuid);
    fetchStateRef.current.isMounted = true;
    
    return () => {
      console.log(`[DreamCard] [${new Date().toISOString()}] Unmounting:`, cardUuid);
      fetchStateRef.current.isMounted = false;
    };
  }, [cardUuid]);

  // Track if this is a new card
  const isNewCardRef = useRef(isNew);
  const [isNewState, setIsNewState] = useState(isNew);

  // Update ref when prop changes
  useEffect(() => {
    if (isNew !== isNewCardRef.current) {
      console.log(`[DreamCard] [${new Date().toISOString()}] isNew ref changed:`, {
        cardUuid,
        oldIsNew: isNewCardRef.current,
        newIsNew: isNew
      });
      isNewCardRef.current = isNew;
    }
  }, [isNew, cardUuid]);

  // Update isNew state when prop changes
  useEffect(() => {
    if (isNew !== isNewState) {
      console.log(`[DreamCard] [${new Date().toISOString()}] isNew state changed:`, {
        cardUuid,
        oldIsNew: isNewState,
        newIsNew: isNew
      });
      setIsNewState(isNew);
    }
  }, [isNew, isNewState, cardUuid]);

  // If we have a full card object passed in, use it as initial state
  const [cardState, setCardState] = useState(() => {
    console.log(`[DreamCard] [${new Date().toISOString()}] Initializing state:`, {
      cardUuid,
      isNew,
      card,
      isNewRef: isNewCardRef.current
    });

    // Always start with isLoading: false for new cards
    if (isNew) {
      return { 
        card: { 
          uuid: cardUuid, 
          title: 'New Card',
          uiState: { isExpanded: false } // Initialize uiState for new cards
        }, 
        error: null, 
        isLoading: false 
      };
    }
    // For existing cards with data, don't start in loading state
    if (card) {
      // Ensure uiState exists
      const cardWithUiState = {
        ...card,
        uiState: card.uiState || { isExpanded: false }
      };
      console.log('[DreamCard] Initializing existing card:', cardWithUiState);
      return {
        card: cardWithUiState,
        error: null,
        isLoading: false
      };
    }

    // For existing cards without data, start in loading state
    return {
      card: null,
      error: null,
      isLoading: true
    };
  });
  const [isExpanded, setIsExpanded] = useState(() => {
    // Initialize from card's UI state if available
    return card?.uiState?.isExpanded || false;
  });
  const [showMenu, setShowMenu] = useState(false);

  console.log(`[DreamCard] [${new Date().toISOString()}] Initial render:`, {
    cardUuid,
    isNew,
    isLoading: cardState.isLoading,
    hasCard: !!cardState.card,
    isNewRef: isNewCardRef.current
  });

  console.log(`[DreamCard] [${new Date().toISOString()}] Initial mount state:`, {
    cardUuid,
    isNewCardRef: isNewCardRef.current,
    card: cardState.card,
    isLoading: cardState.isLoading,
    props: { cardUuid, isNew }
  });

  const dreamCardService = useDreamCardService(dreamStorage);

  const hasComments = useMemo(() => (cardState.card?.comments?.length ?? 0) > 0, [cardState.card?.comments]);
  const hasAttachments = useMemo(() => (cardState.card?.attachments?.length ?? 0) > 0, [cardState.card?.attachments]);
  const hasAssignees = useMemo(() => (cardState.card?.assigneeUuids?.length ?? 0) > 0, [cardState.card?.assigneeUuids]);
  const hasWatchers = useMemo(() => (cardState.card?.watcherUuids?.length ?? 0) > 0, [cardState.card?.watcherUuids]);
  const hasTags = useMemo(() => (cardState.card?.tags?.length ?? 0) > 0, [cardState.card?.tags]);

  const handleUpdate = useCallback(async (updates) => {
    if (!cardState.card) return;

    console.log('[DreamCard] handleUpdate - Starting update:', {
      cardUuid,
      currentCard: cardState.card,
      updates
    });

    try {
      const baseCard = {
        ...cardState.card,
        uuid: cardUuid
      };

      const updatedCard = {
        ...baseCard,
        ...updates,
        uuid: cardUuid,
        updatedAt: new Date().toISOString()
      };

      console.log('[DreamCard] handleUpdate - Saving card:', updatedCard);
      const savedCard = await dreamCardService.saveCard(updatedCard);

      setCardState(prev => ({
        ...prev,
        card: savedCard,
        isLoading: false
      }));

      onUpdate?.(savedCard);
    } catch (err) {
      console.error('[DreamCard] handleUpdate - Error:', err);
      setCardState(prev => ({
        ...prev,
        error: err
      }));
    }
  }, [cardState.card, dreamCardService, onUpdate, cardUuid]);

  const handleToggleExpand = useCallback((e) => {
    e.stopPropagation();
    const newIsExpanded = !isExpanded;
    setIsExpanded(newIsExpanded);
    handleUpdate({ uiState: { isExpanded: newIsExpanded } });
  }, [isExpanded, handleUpdate]);

  const handleEditClick = useCallback((e) => {
    e.stopPropagation();

    console.log('[DreamCard] handleEditClick:', {
      cardUuid,
      currentCard: cardState.card,
      isLoading: cardState.isLoading
    });

    // If we're loading or don't have a card, don't allow edit
    if (cardState.isLoading || !cardState.card) {
      console.log('[DreamCard] handleEditClick - No card to edit or still loading:', { cardUuid, isLoading: cardState.isLoading });
      return;
    }

    // Ensure we have a valid card with required fields
    const cardToEdit = {
      ...cardState.card,
      uuid: cardState.card.uuid || cardUuid,
      cardUuid: cardState.card.cardUuid || cardUuid
    };

    onOpenModal?.(cardToEdit);
  }, [cardState.card, cardState.isLoading, cardUuid, onOpenModal]);

  const handleMenuToggle = useCallback((e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  }, [showMenu]);

  const handleDragStart = useCallback((e) => {
    if (!isDraggable) return;
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.(e, cardState.card);
  }, [isDraggable, cardState.card, onDragStart]);

  // Load card data
  useEffect(() => {
    const fetchState = fetchStateRef.current;
    
    if (!fetchState.isMounted) {
      console.log(`[DreamCard] [${new Date().toISOString()}] Skip load - component not mounted:`, cardUuid);
      return;
    }

    if (isNew || card) {
      console.log(`[DreamCard] [${new Date().toISOString()}] Skip load - card is new or provided:`, {
        cardUuid,
        isNew: isNewState,
        hasCard: !!card
      });
      return;
    }

    const loadingReason = [];
    if (cardState.card) {
      loadingReason.push('Card data exists');
    }

    if (loadingReason.length > 0) {
      console.log(`[DreamCard] [${new Date().toISOString()}] Skip load - reasons:`, {
        cardUuid,
        reasons: loadingReason
      });
      return;
    }

    const loadCard = async () => {
      console.log(`[DreamCard] [${new Date().toISOString()}] Starting load:`, {
        cardUuid,
        isNewState,
        cardState: {
          hasCard: !!cardState.card,
          isLoading: cardState.isLoading
        },
        fetchState: {
          isMounted: fetchState.isMounted,
          isLoading: fetchState.isLoading
        }
      });

      if (fetchState.isLoading) {
        console.log(`[DreamCard] [${new Date().toISOString()}] Skip load - fetch in progress:`, cardUuid);
        return;
      }

      try {
        console.log(`[DreamCard] [${new Date().toISOString()}] Starting load:`, cardUuid);
        fetchState.isLoading = true;
        setCardState(prev => ({ ...prev, error: null, isLoading: true }));
        
        // This will be instant for templates
        let cardData = await dreamCardService.getCard(cardUuid);
        console.log(`[DreamCard] [${new Date().toISOString()}] Load result:`, { cardUuid, cardData });
        
        // Always reset loading state, even if unmounted
        fetchState.isLoading = false;
        
        // Step 2: Handle unmounted case
        if (!fetchState.isMounted) {
          console.log(`[DreamCard] [${new Date().toISOString()}] Skip update - not mounted:`, cardUuid);
          // Critical: Reset loading state even when unmounted to prevent deadlocks
          // But preserve existing card data and UI state
          setCardState(prev => ({ ...prev, isLoading: false, card: prev.card }));
          return;
        }

        if (cardData) {
          console.log(`[DreamCard] [${new Date().toISOString()}] Updating state with data:`, { cardUuid, cardData });
          setCardState(prev => ({
            ...prev,
            card: cardData,
            isLoading: false,
            error: null
          }));
          
          // Only notify parent if it's not a template load
          if (!cardData.isTemplate) {
            console.log(`[DreamCard] [${new Date().toISOString()}] Notifying parent:`, { cardUuid, cardData });
            onUpdate?.(cardData);
          }
        } else {
          console.error(`[DreamCard] [${new Date().toISOString()}] No card data found:`, cardUuid);
          setCardState(prev => ({
            ...prev,
            error: new Error('Card not found'),
            isLoading: false
          }));
        }
      } catch (err) {
        console.error(`[DreamCard] [${new Date().toISOString()}] Error loading card:`, { cardUuid, error: err });
        if (fetchState.isMounted) {
          setCardState(prev => ({
            ...prev,
            error: err,
            isLoading: false
          }));
        }
      } finally {
        console.log(`[DreamCard] [${new Date().toISOString()}] Load complete:`, cardUuid);
        fetchState.lastFetchTime = Date.now();
      }
    };

    loadCard();

    return () => {
      console.log(`[DreamCard] [${new Date().toISOString()}] Unmounting:`, cardUuid);
      fetchState.isMounted = false;
    };
  }, [cardUuid, dreamCardService, onUpdate]);

  // Handle polling - only for non-new cards
  useEffect(() => {
    // Don't set up polling for new cards at all
    if (isNewState) {
      console.log(`[DreamCard] Skip polling - card is new:`, cardUuid);
      return;
    }

    // Don't poll if we already have card data
    if (cardState.card) {
      console.log(`[DreamCard] Skip polling - already have card:`, cardUuid);
      return;
    }

    // Don't poll if we're loading
    if (cardState.isLoading) {
      console.log(`[DreamCard] Skip polling - currently loading:`, cardUuid);
      return;
    }

    console.log(`[DreamCard] Setting up polling for:`, cardUuid);
    const intervalId = setInterval(() => {
      const fetchState = fetchStateRef.current;
      
      // Skip if already loading or updating
      if (fetchState.isLoading || fetchState.isUpdating) {
        return;
      }

      // Only poll if we don't have card data
      if (cardState.card) {
        clearInterval(intervalId);
        return;
      }

      const handlePoll = async () => {
        if (!fetchState.isMounted) return;
        
        try {
          fetchState.isUpdating = true;
          const updatedCard = await dreamCardService.getCard(cardUuid);
          
          if (!fetchState.isMounted) return;
          
          if (updatedCard) {
            setCardState(prev => ({
              ...prev,
              card: updatedCard,
              isLoading: false
            }));
            // Clear interval once we have data
            clearInterval(intervalId);
          }
        } catch (error) {
          console.error(`[DreamCard] Poll error:`, error);
        } finally {
          fetchState.isUpdating = false;
        }
      };

      handlePoll();
    }, POLL_INTERVAL);

    return () => {
      clearInterval(intervalId);
      fetchStateRef.current.isMounted = false;
    };
  }, [cardState.card, cardState.isLoading, isNewState, cardUuid, dreamCardService]);

  const handleCardClick = useCallback((e) => {
    console.log('[DreamCard] handleCardClick - Start:', {
      target: e.target,
      isPencilClick: !!e.target.closest('.dream-card-edit'),
      currentTarget: e.currentTarget
    });
    
    // If clicking edit button, use that handler instead
    if (e.target.closest('.dream-card-edit')) {
      console.log('[DreamCard] handleCardClick - Pencil clicked, delegating to handleEditClick');
      return handleEditClick(e);
    }
    
    e.stopPropagation(); // Stop event bubbling
    
    console.log('[DreamCard] Click - Before State:', {
      cardUuid,
      isExpanded,
      cardState,
      uiState: cardState.card?.uiState,
      classes: `dream-card ${className} ${isSelected ? 'selected' : ''} ${isExpanded ? 'expanded' : ''}`
    });
    
    // if (!cardState.card) {
    //   console.log('[DreamCard] Click - No card in state, exiting');
    //   return;
    // }
    
    console.log('[DreamCard] Click - About to toggle expansion');
    const newIsExpanded = !isExpanded;
    setIsExpanded(newIsExpanded);

    console.log('[DreamCard] Click - After Toggle:', {
      newIsExpanded,
      cardState,
      cardStateCard: cardState.card,
      uiStateToUpdate: {
        ...(cardState.card?.uiState || {}),
        isExpanded: newIsExpanded,
        lastViewedAt: new Date().toISOString()
      }
    });

    // Skip update if card is not initialized yet
    if (!cardState.card) {
      console.log('[DreamCard] Click - No card in state, skipping update');
      return;
    }

    try {
      handleUpdate({
        uiState: {
          ...(cardState.card?.uiState || {}),
          isExpanded: newIsExpanded,
          lastViewedAt: new Date().toISOString(),
          style: cardState.card?.uiState?.style || {}
        }
      });
      console.log('[DreamCard] Click - Update completed');
    } catch (err) {
      console.error('[DreamCard] Click - Error during update:', err);
    }
  }, [isExpanded, cardState.card, handleUpdate, cardUuid, className, isSelected, handleEditClick]);

  // Force a refresh
  const refreshCard = useCallback(() => {
    setCardState(prev => ({ ...prev, isLoading: true }));
  }, []);

  // Show loading state until we have real data
  if (cardState.isLoading && !isNew) {
    return (
      <div className={`dream-card ${className}`}>
        <div className="dream-card-basic">
          <div className="dream-card-header">
            <span className="dream-card-header-date">Loading...</span>
          </div>
          <div className="dream-card-title-row">
            <h3 className="dream-card-title">Loading...</h3>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (cardState.error) {
    return (
      <div className={`dream-card ${className}`}>
        <div className="dream-card-basic">
          <div className="dream-card-header">
            <span className="dream-card-header-date" style={{ color: 'red' }}>Error</span>
          </div>
          <div className="dream-card-title-row">
            <h3 className="dream-card-title" style={{ color: 'red' }}>Error loading card</h3>
          </div>
        </div>
      </div>
    );
  }

  const renderBasicContent = () => (
    <div className="dream-card-basic" onClick={handleToggleExpand}>
      <div className="dream-card-header">
        <span className="dream-card-header-date">{cardState.card?.dueDate ? formatDateForDisplay(cardState.card.dueDate) : 'Wed December 25, 2024'}</span>
        <div style={{ flex: 1 }}></div>
        <ProgressBarIcon progress={75} width={32} height={4} />
      </div>
      <div className="dream-card-title-row">
        <h3 className="dream-card-title">{cardState.card?.title || 'New Card'}</h3>
        <button 
          className="dream-card-edit"
          onClick={handleEditClick}
          aria-label="Edit card"
        >
          <PencilIcon size={16} />
        </button>
      </div>
      <div className="dream-card-spacer"></div>
      <div className="dream-card-next-step">
        <div className="dream-card-next-step-text">Next step placeholder</div>
        <div className="dream-card-next-step-date">09:28</div>
      </div>
    </div>
  );

  const renderExtendedContent = () => {
    if (!isExpanded) return null;

    return (
      <div className="dream-card-extended">
        <div className="dream-card-dates">
          {cardState.card?.dueDate && (
            <div className="dream-card-date">
              <Calendar size={14} />
              <span>Due: {formatDateForDisplay(cardState.card.dueDate)}</span>
            </div>
          )}
          <div className="dream-card-date">
            <Clock size={14} />
            <span>Created: {formatDateForDisplay(cardState.card?.createdAt)}</span>
          </div>
        </div>

        {hasTags && (
          <div className="dream-card-tags">
            {cardState.card?.tags?.map(tag => (
              <span key={tag} className="dream-card-tag">
                <Tag size={12} />
                {tag}
              </span>
            ))}
          </div>
        )}

        {hasAssignees && (
          <div className="dream-card-assignee-list">
            <h4>Assignees</h4>
            {cardState.card?.assigneeUuids?.map(uuid => (
              <div key={uuid} className="dream-card-assignee">
                <User size={14} />
                <span>{uuid}</span>
              </div>
            ))}
          </div>
        )}

        <div className="dream-card-metrics">
          <div className="dream-card-metric">
            <Eye size={14} />
            <span>{cardState.card?.metrics?.views} views</span>
          </div>
          <div className="dream-card-metric">
            <Share2 size={14} />
            <span>{cardState.card?.metrics?.shares} shares</span>
          </div>
          <div className="dream-card-metric">
            <MessageSquare size={14} />
            <span>{cardState.card?.metrics?.comments} comments</span>
          </div>
        </div>

        {hasComments && (
          <div className="dream-card-comments">
            <h4>Comments</h4>
            {cardState.card?.comments?.map(comment => (
              <div key={comment.uuid} className="dream-card-comment">
                <div className="dream-comment-header">
                  <User size={14} />
                  <span>{comment.authorUuid}</span>
                  <span className="dream-comment-date">
                    {formatDateForDisplay(comment.createdAt)}
                  </span>
                </div>
                <p className="dream-comment-content">{comment.content}</p>
              </div>
            ))}
          </div>
        )}

        {hasAttachments && (
          <div className="dream-card-attachments">
            <h4>Attachments</h4>
            {cardState.card?.attachments?.map(attachment => (
              <div key={attachment.uuid} className="dream-card-attachment">
                <Paperclip size={14} />
                <a 
                  href={attachment.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {attachment.name}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`dream-card ${className} ${isSelected ? 'selected' : ''} ${isExpanded ? 'expanded' : ''} dream-card-type-${cardState.card?.type} dream-card-status-${cardState.card?.status}`}
      onClick={handleCardClick}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      style={{
        backgroundColor: cardState.card?.uiState?.style?.bgColor,
        color: cardState.card?.uiState?.style?.fgColor,
        fontFamily: cardState.card?.uiState?.style?.fontFamily,
        fontSize: cardState.card?.uiState?.style?.fontSize
      }}
    >
      {renderBasicContent()}
      {isExpanded && renderExtendedContent()}
    </div>
  );
};

DreamCard.propTypes = {
  cardUuid: PropTypes.string,
  card: PropTypes.object,
  onUpdate: PropTypes.func,
  onOpenModal: PropTypes.func,
  isDraggable: PropTypes.bool,
  isSelected: PropTypes.bool,
  onClick: PropTypes.func,
  onDragStart: PropTypes.func,
  onDragEnd: PropTypes.func,
  isNew: PropTypes.bool,
  className: PropTypes.string
};

export default React.memo(DreamCard);
