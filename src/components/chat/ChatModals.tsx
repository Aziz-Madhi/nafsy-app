import React from "react";
import { ChatSearch } from "@/components/chat/ChatSearch";
import { ReactionPicker } from "@/components/chat/ReactionPicker";
import { ConversationSummary } from "@/components/chat/ConversationSummary";
import { ConversationHistory } from "@/components/chat/ConversationHistory";
import { ChatManagement } from "@/components/chat/ChatManagement";
import { groupMessagesByDate } from "@/utils/dateHelpers";

interface ChatModalsProps {
  showSearch: boolean;
  setShowSearch: (show: boolean) => void;
  showSummary: boolean;
  setShowSummary: (show: boolean) => void;
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  showManagement: boolean;
  setShowManagement: (show: boolean) => void;
  showReactionPicker: boolean;
  setShowReactionPicker: (show: boolean) => void;
  reactionPickerPosition: { x: number; y: number };
  selectedMessageId: string | null;
  setSelectedMessageId: (id: string | null) => void;
  activeConversation: any;
  conversations: any[];
  isLoadingConversations: boolean;
  messages: any[];
  locale: string;
  listRef: React.RefObject<any>;
  onStartNewChat: () => void;
  onSwitchConversation: (conversationId: string) => void;
  onAddReaction: (messageId: string, type: string, emoji: string) => void;
}

export function ChatModals({
  showSearch,
  setShowSearch,
  showSummary,
  setShowSummary,
  showHistory,
  setShowHistory,
  showManagement,
  setShowManagement,
  showReactionPicker,
  setShowReactionPicker,
  reactionPickerPosition,
  selectedMessageId,
  setSelectedMessageId,
  activeConversation,
  conversations,
  isLoadingConversations,
  messages,
  locale,
  listRef,
  onStartNewChat,
  onSwitchConversation,
  onAddReaction,
}: ChatModalsProps) {
  return (
    <>
      {/* Search Modal */}
      <ChatSearch
        isVisible={showSearch}
        onClose={() => setShowSearch(false)}
        conversationId={activeConversation?._id}
        locale={locale}
        onSelectMessage={(messageId) => {
          // Find the message in the current list and scroll to it
          const messageIndex = messages.findIndex(msg => msg._id === messageId);
          if (messageIndex !== -1 && listRef.current) {
            // Calculate which group the message is in
            const groups = groupMessagesByDate(messages, locale);
            let flatIndex = 0;
            let found = false;
            
            for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
              const group = groups[groupIndex];
              const messageInGroup = group.messages.findIndex(msg => msg._id === messageId);
              
              if (messageInGroup !== -1) {
                flatIndex = groupIndex;
                found = true;
                break;
              }
            }
            
            if (found) {
              listRef.current.scrollToIndex({ index: flatIndex, animated: true });
            }
          }
        }}
      />
      
      {/* Reaction Picker */}
      <ReactionPicker
        isVisible={showReactionPicker}
        onClose={() => {
          setShowReactionPicker(false);
          setSelectedMessageId(null);
        }}
        position={reactionPickerPosition}
        onSelectReaction={(type, emoji) => {
          if (selectedMessageId) {
            onAddReaction(selectedMessageId, type, emoji);
          }
        }}
      />
      
      {/* Chat Management */}
      <ChatManagement
        isVisible={showManagement}
        onClose={() => setShowManagement(false)}
        onNewChat={onStartNewChat}
        conversations={conversations}
        isLoadingConversations={isLoadingConversations}
        onSelectConversation={onSwitchConversation}
        activeConversationId={activeConversation?._id}
        onRequestSummary={() => {
          setShowManagement(false);
          setShowSummary(true);
        }}
      />

      {/* Conversation History */}
      <ConversationHistory
        isVisible={showHistory}
        onClose={() => setShowHistory(false)}
        conversations={conversations}
        isLoading={isLoadingConversations}
        onSelectConversation={onSwitchConversation}
        activeConversationId={activeConversation?._id}
      />

      {/* Conversation Summary */}
      <ConversationSummary
        isVisible={showSummary}
        onClose={() => setShowSummary(false)}
        conversationId={activeConversation?._id}
        language={locale}
      />
    </>
  );
}