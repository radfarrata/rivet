export const POSTS_KEY = ['rivet-posts'];
export const flatPosts = data => data?.pages?.flatMap(page => page.items) || [];
export const mapPostCache = (data, change) => data ? ({...data,pages:data.pages.map(page=>({...page,items:page.items.map(post=>change(post))}))}) : data;
export const patchPost = (data,id,patch) => mapPostCache(data,post=>post.id===id?{...post,...(typeof patch==='function'?patch(post):patch)}:post);
export const prependPost = (data,post) => !data ? {pages:[{items:[post],nextCursor:null}],pageParams:[null]} : flatPosts(data).some(item=>item.id===post.id) ? patchPost(data,post.id,post) : ({...data,pages:data.pages.map((page,index)=>index?page:{...page,items:[post,...page.items]})});
export const removePost = (data,id) => data ? ({...data,pages:data.pages.map(page=>({...page,items:page.items.filter(post=>post.id!==id)}))}) : data;
export const replacePost = (data,id,post) => mapPostCache(data,item=>item.id===id?post:item);
export const reconcilePost = (data,tempId,post) => {
  const exists=flatPosts(data).some(item=>item.id===post.id),clean=removePost(data,tempId);
  return exists?patchPost(clean,post.id,post):prependPost(clean,post);
};