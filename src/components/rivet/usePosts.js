import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { POSTS_KEY, flatPosts, patchPost, prependPost, removePost, reconcilePost } from '@/components/rivet/feed/postCache';
const PAGE_SIZE=20;
const snapshot=client=>client.getQueryData(POSTS_KEY);
const restore=(client,previous)=>client.setQueryData(POSTS_KEY,previous);
export function usePosts() {
  const queryClient=useQueryClient();
  useEffect(()=>base44.entities.Post.subscribe(event=>{
    queryClient.setQueryData(POSTS_KEY,data=>event.type==='delete'?removePost(data,event.id):event.type==='create'?prependPost(data,event.data):patchPost(data,event.id,event.data));
  }),[queryClient]);
  const query=useInfiniteQuery({queryKey:POSTS_KEY,initialPageParam:null,queryFn:async({pageParam})=>{
    const items=pageParam
      ? await base44.entities.Post.filter({created_date:{$lt:pageParam.created_date}},'-created_date',PAGE_SIZE)
      : await base44.entities.Post.list('-created_date',PAGE_SIZE);
    const last=items[items.length-1];
    return {items,nextCursor:items.length===PAGE_SIZE?{id:last.id,created_date:last.created_date}:null};
  },getNextPageParam:last=>last.nextCursor,staleTime:15000});
  return {...query,data:flatPosts(query.data)};
}
export function useCreatePost() {
  const client=useQueryClient();
  return useMutation({mutationFn:data=>base44.entities.Post.create(data),onMutate:async data=>{await client.cancelQueries({queryKey:POSTS_KEY});const previous=snapshot(client),temp={...data,id:`pending-${Date.now()}`,created_date:new Date().toISOString(),_pending:true};client.setQueryData(POSTS_KEY,cache=>prependPost(cache,temp));return {previous,temp};},onError:(_e,_v,ctx)=>restore(client,ctx.previous),onSuccess:(saved,_v,ctx)=>client.setQueryData(POSTS_KEY,data=>reconcilePost(data,ctx.temp.id,saved))});
}
export function useUpvote() {
  const client=useQueryClient();
  return useMutation({mutationFn:({id,upvotes})=>base44.entities.Post.update(id,{upvotes:(upvotes||0)+1}),onMutate:async({id})=>{await client.cancelQueries({queryKey:POSTS_KEY});const previous=snapshot(client);client.setQueryData(POSTS_KEY,data=>patchPost(data,id,p=>({upvotes:(p.upvotes||0)+1})));return {previous};},onError:(_e,_v,ctx)=>restore(client,ctx.previous),onSuccess:(saved)=>client.setQueryData(POSTS_KEY,data=>patchPost(data,saved.id,saved))});
}
const toggleList=(name,countName,currentUser)=>(client,post)=>{const list=post[name]||[],has=list.includes(currentUser.id),next=has?list.filter(id=>id!==currentUser.id):[...list,currentUser.id];client.setQueryData(POSTS_KEY,data=>patchPost(data,post.id,{[name]:next,...(countName?{[countName]:next.length}:{})}));return next;};
export function useToggleSave(currentUser) {const client=useQueryClient();return useMutation({mutationFn:({post})=>{const list=post.savedBy||[],next=list.includes(currentUser.id)?list.filter(id=>id!==currentUser.id):[...list,currentUser.id];return base44.entities.Post.update(post.id,{savedBy:next});},onMutate:async({post})=>{await client.cancelQueries({queryKey:POSTS_KEY});const previous=snapshot(client),next=toggleList('savedBy',null,currentUser)(client,post);return {previous,next};},onError:(_e,_v,ctx)=>restore(client,ctx.previous),onSuccess:saved=>client.setQueryData(POSTS_KEY,data=>patchPost(data,saved.id,saved))});}
export function useToggleRepost(currentUser) {const client=useQueryClient();return useMutation({mutationFn:({post})=>{const list=post.repostedBy||[],next=list.includes(currentUser.id)?list.filter(id=>id!==currentUser.id):[...list,currentUser.id];return base44.entities.Post.update(post.id,{repostedBy:next,reposts:next.length});},onMutate:async({post})=>{await client.cancelQueries({queryKey:POSTS_KEY});const previous=snapshot(client),next=toggleList('repostedBy','reposts',currentUser)(client,post);return {previous,next};},onError:(_e,_v,ctx)=>restore(client,ctx.previous),onSuccess:saved=>client.setQueryData(POSTS_KEY,data=>patchPost(data,saved.id,saved))});}
export function useVotePoll(currentUser) {const client=useQueryClient();return useMutation({mutationFn:({post,optionId})=>{const options=(post.poll?.options||[]).map(option=>{const voterIds=(option.voterIds||[]).filter(id=>id!==currentUser.id);if(option.id===optionId)voterIds.push(currentUser.id);return {...option,voterIds};});return base44.entities.Post.update(post.id,{poll:{...post.poll,options}});},onMutate:async({post,optionId})=>{await client.cancelQueries({queryKey:POSTS_KEY});const previous=snapshot(client),options=(post.poll?.options||[]).map(option=>{const voterIds=(option.voterIds||[]).filter(id=>id!==currentUser.id);if(option.id===optionId)voterIds.push(currentUser.id);return {...option,voterIds};});client.setQueryData(POSTS_KEY,data=>patchPost(data,post.id,{poll:{...post.poll,options}}));return {previous,options};},onError:(_e,_v,ctx)=>restore(client,ctx.previous),onSuccess:saved=>client.setQueryData(POSTS_KEY,data=>patchPost(data,saved.id,saved))});}