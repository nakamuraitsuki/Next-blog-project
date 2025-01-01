//linkCard用のNode
export interface LinkCardNode extends Node {
    type: 'linkCard';
    url: string;
}