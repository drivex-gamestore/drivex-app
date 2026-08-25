import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { Draggable } from 'gsap/Draggable';
import { cx as classVarianceCx } from "class-variance-authority";

gsap.registerPlugin(
    ScrollTrigger, 
    ScrambleTextPlugin, 
    SplitText, 
    Flip,
    Draggable,
    InertiaPlugin
 );

export { 
    gsap, 
    useGSAP,        
    ScrollTrigger, 
    SplitText, 
    ScrambleTextPlugin, 
    Flip,
    Draggable,
    InertiaPlugin
 };


export const cx = classVarianceCx;
export { cva } from "class-variance-authority";
