// Small explanatory models, isolated from the real project services.
export function reserveExample(state){return state.reserved?{...state,replayed:true}:{stock:state.stock-1,reserved:true,replayed:false};}
export function matchingTrio(shapes){return shapes.length===3&&shapes.every(shape=>shape===shapes[0]);}
