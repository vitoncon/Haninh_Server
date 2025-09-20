export interface Menu {
	id : string;
	icon : string;
	title : string;
	pms : number[]; //[1, 0, 0, 0] <=> [canAccess,canAdd,canEdit,canDelete]
	position : string; // 'left' | 'top'
	child? : Menu[];
}

export interface MenuAdvance extends Menu {
	canAccess : boolean,
	canAdd : boolean,
	canEdit : boolean,
	canDelete : boolean,
}