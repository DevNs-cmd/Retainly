import { Trigger,TriggerType } from '../data/entities';
export interface EvaluationEvent { type:string; score?:number; previousScore?:number; inactivityDays?:number; status?:string; }
export function matchesTrigger(trigger:Trigger,event:EvaluationEvent):boolean{
 const c=trigger.conditions;
 switch(trigger.type){
 case TriggerType.RISK_SCORE_ABOVE:return typeof event.score==='number'&&typeof c.threshold==='number'&&event.score>c.threshold;
 case TriggerType.RISK_SCORE_CHANGE:return typeof event.score==='number'&&typeof event.previousScore==='number'&&typeof c.delta==='number'&&(c.delta>=0?event.score-event.previousScore>=c.delta:event.score-event.previousScore<=c.delta);
 case TriggerType.INACTIVITY_DAYS:return typeof event.inactivityDays==='number'&&typeof c.days==='number'&&event.inactivityDays>=c.days;
 case TriggerType.ENROLLMENT_STATUS:return event.type==='enrollment.status.changed'&&event.status===c.status;
 case TriggerType.PAYMENT_FAILED:return event.type==='payment.failed';
 case TriggerType.MANUAL:return event.type==='MANUAL';
 default:return false;
 }
}

