// Shared with the offline regression tests. Coordinates are iframe viewport coordinates.
(function(root){
 const api={
  viewport(height,bridge,embedded){
   if(embedded&&!bridge)return null;
   const top=bridge?Math.max(0,-Number(bridge.frameTop)):0;
   const visible=bridge?Math.max(0,Number(bridge.visibleHeight)):height;
   if(!Number.isFinite(top)||!Number.isFinite(visible))return null;
   return {top,bottom:Math.min(height,top+visible)};
  },
  seen(rect,viewport,width,fraction=.5){
   if(!viewport||rect.width<=0||rect.height<=0||viewport.bottom<=viewport.top)return false;
   const h=Math.max(0,Math.min(rect.bottom,viewport.bottom)-Math.max(rect.top,viewport.top));
   const w=Math.max(0,Math.min(rect.right,width)-Math.max(rect.left,0));
   return h>=Math.min(80,rect.height)&&h*w>=Math.min(rect.height,viewport.bottom-viewport.top)*Math.min(rect.width,width)*fraction;
  },
  depth(scrollY,documentHeight,viewport){
   if(!viewport||viewport.bottom<=viewport.top||documentHeight<=0)return null;
   return Math.min(100,Math.max(0,Math.round((scrollY+viewport.bottom)/documentHeight*100)));
  }
 };
 if(typeof module==='object')module.exports=api;else root.HanxinAnalyticsGeometry=api;
})(typeof window==='object'?window:globalThis);
