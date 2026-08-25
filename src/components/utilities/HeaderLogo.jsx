import React from 'react';
import { Link } from '@shared/constants/navigation';
import { cx } from '@lib/vendor';

export function LogoGood(props) {
  const { className, ...rest } = props;
  
  const style = {
    fill: "var(--color-foreground)",
    transition: "fill 300ms ease-out"
  };
  
  const mergedClassName = cx(className); 

  return (
    <svg
      viewBox="0 0 1616.59 529.18"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Good"
      role="img"
      style={style}
      className={mergedClassName}
      {...rest}
    >
      <path d="M212.88,248.5c-1.92-1.89-3.17-4.57-3.17-8.06V90.87c0-15.24,23.65-15.22,23.65,0v137.74h176.04V13c0-9.05-4.51-13-12.95-13H123.9C77.16,0,46.22,31.1,46.22,78.02l-.03,373.14c0,46.93,30.97,78.02,77.71,78.02h274.81c6.19,0,10.7-4.52,10.7-10.74V252.27H221.51c-3.85,0-6.72-1.51-8.63-3.77ZM233.34,311.59v113.56c0,15.24-23.65,15.22-23.65,0V311.59c0-15.24,23.65-15.22,23.65,0Z" />
      <path d="M718.71,0H510.92c-46.74,0-77.71,31.1-77.71,78.02v373.14c0,46.93,30.97,78.02,77.71,78.02h207.79c46.74,0,77.71-31.1,77.71-78.02V78.02C796.42,31.1,765.45,0,718.71,0ZM619.12,424.77c0,15.24-23.65,15.22-23.65,0V106.7c0-15.24,23.65-15.22,23.65,0v318.07Z" />
      <path d="M1183.34,78.02c0-46.93-30.97-78.02-77.71-78.02H897.84c-46.74,0-77.71,31.1-77.71,78.02v373.14c0,46.93,30.97,78.02,77.71,78.02h275.57c7.58,0,9.94-4.53,9.94-10.74V78.02ZM1012.47,425.67c0,15.24-23.65,15.22-23.65,0V105.34c0-15.24,23.65-15.22,23.65,0v320.33Z" />
      <path d="M1217.67,529.18h274.81c46.74,0,77.71-31.1,77.71-78.02V78.02c0-46.93-30.97-78.02-77.71-78.02h-274.81c-6.19,0-10.7,4.52-10.7,10.74v507.7c0,6.22,4.51,10.74,10.7,10.74ZM1368.17,105.34c0-15.24,23.65-15.22,23.65,0v320.1c0,15.24-23.65,15.22-23.65,0V105.34Z" />
    </svg>
  );
}

export function LogoFella(props) {
  const { className, ...rest } = props;
  
  const style = {
    fill: "var(--color-foreground)",
    transition: "fill 300ms ease-out"
  };
  
  const mergedClassName = cx(className); 

  return (
    <svg
      viewBox="0 0 1616.59 556.07"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Fella"
      role="img"
      style={style}
      className={mergedClassName}
      {...rest}
    >
      <path d="M232.92,218.94c-15.24,0-15.22-24.24,0-24.24h176.47l-.02-171.91c0-8.45-4.51-12.95-12.95-12.95H121.13c-42.8,0-74.97,34.91-74.97,77.71v438.68c0,6.19,5.25,10.7,12.92,10.7,86.01,0,155.36-56.99,164.69-132.81h173.34c8.96,0,12.31-6.8,12.31-14.39l-.02-170.79h-176.47Z" />
      <path d="M613.38,218.08v63.14c0,15.24-23.65,15.22-23.65,0V206.26c0-6.41,5.43-12.43,11.83-12.43h194.3V86.57c0-46.74-30.97-77.71-77.71-77.71H510.92c-46.74,0-77.71,30.97-77.71,77.71v238.77c0,46.74,30.97,77.71,77.71,77.71h207.23c46.74,0,77.71-30.97,77.71-77.71V218.1H613.38ZM589.73,95.94c0-15.24,23.65-15.22,23.65,0v50.27c0,15.24-23.65,15.22-23.65,0V95.94Z" />
      <path d="M976.42,8.84h-76.36c-55.23,0-80.53,24.42-80.53,77.15v304.09c0,8.45,4.51,12.95,12.95,12.95h143.94c8.45,0,12.95-4.51,12.95-12.95V8.84c0-8.45-4.51-12.95-12.95-12.95Z" />
      <path d="M1170.15,8.84h-144.09c-8.45,0-12.95,4.51-12.95,12.95v368.29c0,8.45,4.51,12.95,12.95,12.95h76.52c55.23,0,80.53-24.42,80.53-77.15V8.84c0-8.45-4.51-12.95-12.95-12.95Z" />
      <path d="M1491.91,8.84h-271.43c-9.01,0-13.52,4.51-13.52,13.52v171.15h173.6V95.46c0-15.24,23.65-15.22,23.65,0v109.2c0,6.41-5.43,13.18-11.83,13.18h-185.43v107.49c0,46.74,30.97,77.71,77.71,77.71h106.99c15.77,0,25.46-13.52,27.15-29.28v-71.66c.56-6.19,6.22-10.14,12.42-10.14,5.07,0,11.86,4.66,11.29,9.72l-.06,88.41c0,9,2.82,12.95,11.26,12.95h102.94c8.45,0,13.76-4.51,13.76-12.95V86.55c0-46.74-31.78-77.71-78.52-77.71Z" />
    </svg>
  );
}

export function HeaderLogo({ isMenuOpen, className }) {
  const containerClass = cx("relative block h-24 shrink-0 overflow-hidden transition-colors duration-300", className);
  const transformValue = `translateY(${isMenuOpen ? -26 : 0}px)`;
  
  const style = { transform: transformValue };

  return (
    <Link href="/" className={containerClass} aria-label="Good Fella - Home">
      <div className="flex flex-col gap-2 transition-transform duration-500 ease-out" style={style}>
        <div className="h-24 shrink-0">
          <LogoGood className="h-24 w-auto" />
        </div>
        <div className="h-24 shrink-0">
          <LogoFella className="h-24 w-auto" />
        </div>
      </div>
    </Link>
  );
}
