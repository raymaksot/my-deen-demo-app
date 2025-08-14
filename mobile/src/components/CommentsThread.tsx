import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { CommentDto, ParentType } from '../services/commentsService';
import { createComment, deleteComment, fetchComments, likeComment, unlikeComment, updateComment } from '../store/commentsSlice';

export function CommentsThread(props: { parentType: ParentType; parentId: string; canEdit?: (c: CommentDto) => boolean }) {
  const { parentType, parentId, canEdit } = props;
  const dispatch = useDispatch();
  const k = `${parentType}:${parentId}`;
  const state = useSelector((s: RootState) => s.comments.byParent[k]) || { items: [], page: 1, total: 0, loading: false };
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    // @ts-ignore
    dispatch(fetchComments({ parentType, parentId }));
  }, [parentType, parentId, dispatch]);

  function submit() {
    const content = text.trim();
    if (!content) return;
    if (editingId) {
      // @ts-ignore
      dispatch(updateComment({ id: editingId, text: content }));
      setEditingId(null);
    } else {
      // @ts-ignore
      dispatch(createComment({ parentType, parentId, text: content }));
    }
    setText('');
  }

  function renderItem({ item }: { item: CommentDto }) {
    const editable = canEdit?.(item) ?? false;
    return (
      <View style={styles.comment}>
        <Text style={styles.meta}>{new Date(item.createdAt).toLocaleString()}</Text>
        <Text style={styles.text}>{item.text}</Text>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => (/* @ts-ignore */ dispatch(likeComment(item._id)))} style={styles.btnSm}>
            <Text>👍 {item.likesCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => (/* @ts-ignore */ dispatch(unlikeComment(item._id)))} style={styles.btnSm}>
            <Text>↩︎</Text>
          </TouchableOpacity>
          {editable && (
            <>
              <TouchableOpacity onPress={() => { setEditingId(item._id); setText(item.text); }} style={styles.btnSm}>
                <Text>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => (/* @ts-ignore */ dispatch(deleteComment(item._id)))} style={styles.btnSm}>
                <Text style={{ color: '#b91c1c' }}>Delete</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList data={state.items} keyExtractor={(i) => i._id} renderItem={renderItem} ListEmptyComponent={<Text style={styles.empty}>{state.loading ? 'Loading…' : 'No comments yet'}</Text>} />
      <View style={styles.inputRow}>
        <TextInput value={text} onChangeText={setText} placeholder={editingId ? 'Edit your comment' : 'Write a comment'} style={styles.input} multiline />
        <TouchableOpacity onPress={submit} style={styles.send}>
          <Text style={{ color: '#fff' }}>{editingId ? 'Save' : 'Send'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8 },
  comment: { paddingVertical: 8, borderBottomColor: '#e5e7eb', borderBottomWidth: 1 },
  meta: { color: '#6b7280', marginBottom: 4 },
  text: { fontSize: 14, lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  btnSm: { paddingVertical: 4, paddingHorizontal: 8, backgroundColor: '#f3f4f6', borderRadius: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 8 },
  input: { flex: 1, borderColor: '#e5e7eb', borderWidth: 1, borderRadius: 8, padding: 10, minHeight: 42 },
  send: { backgroundColor: '#0E7490', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 },
  empty: { textAlign: 'center', color: '#6b7280', paddingVertical: 8 },
});