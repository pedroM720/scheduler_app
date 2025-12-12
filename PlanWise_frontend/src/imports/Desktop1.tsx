import svgPaths from "./svg-7yk8i7m96t";
import { imgRectangle3 } from "./svg-nceqf";

interface DesktopProps {
  onMenuClick: () => void;
  onJoinGroupClick: () => void;
  onCreateGroupClick: () => void;
}

function LandingPageMainText() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[48px] items-start justify-center leading-[normal] left-[36px] not-italic overflow-clip px-[47px] py-[55px] top-[122px]" data-name="landing page main text">
      <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[110px] text-nowrap text-white whitespace-pre">{`Meet PlanWise `}</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[77px] text-white w-[530px]">For plans that make it out of the group chat</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[28px] text-[rgba(255,255,255,0.7)] w-[544px]">find the best time for your group to meet, hassle free</p>
    </div>
  );
}

function MaskGroup() {
  return (
    <div className="absolute contents left-[209px] top-[48px]" data-name="Mask group">
      <div className="absolute h-[53px] left-[205px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[5.648px_9px] mask-size-[201.463px_38.182px] top-[48px] w-[213px]" style={{ maskImage: `url('${imgRectangle3}')` }} />
    </div>
  );
}

function Frame({ onJoinGroupClick, onCreateGroupClick }: { onJoinGroupClick: () => void; onCreateGroupClick: () => void }) {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[58px] items-center justify-center left-[816px] overflow-clip pb-[30px] pt-[32px] px-[40px] top-[395px] w-[624px]">
      <button 
        onClick={onJoinGroupClick}
        className="bg-white h-[80px] rounded-[15px] shadow-[3px_5px_3px_0px_rgba(0,0,0,0.25)] shrink-0 w-[470px] cursor-pointer transition-all duration-200 hover:shadow-[5px_8px_8px_0px_rgba(0,0,0,0.4)] active:shadow-[2px_3px_2px_0px_rgba(0,0,0,0.2)] active:translate-y-[2px] flex items-center justify-center relative overflow-hidden"
      >
        <p className="font-['Inter:Regular',sans-serif] font-normal text-[40px] whitespace-pre relative z-10" style={{
          background: 'linear-gradient(135deg, #549EFF 5%, #8570FF 74%, #A06EFF 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          backgroundSize: '200% 200%',
          animation: 'gradientShift 8s ease infinite'
        }}>Join Group</p>
      </button>
      <button 
        onClick={onCreateGroupClick}
        className="relative h-[80px] rounded-[15px] shrink-0 w-[470px] cursor-pointer transition-all duration-200 active:translate-y-[2px] flex items-center justify-center group overflow-hidden"
      >
        <div className="absolute inset-0 bg-[rgba(255,255,255,0)] group-hover:bg-white rounded-[15px] transition-all duration-200" />
        <div aria-hidden="true" className="absolute border-[1.5px] border-solid border-white group-hover:border-transparent inset-0 pointer-events-none rounded-[15px] shadow-[2px_3px_3px_0px_rgba(0,0,0,0.25)] group-hover:shadow-[5px_8px_8px_0px_rgba(0,0,0,0.4)] transition-all duration-200" />
        <p className="font-['Inter:Regular',sans-serif] font-normal text-[40px] whitespace-pre relative z-10 transition-all duration-200 group-hover:hidden">
          <span style={{
            color: 'white'
          }}>Create Group</span>
        </p>
        <p className="font-['Inter:Regular',sans-serif] font-normal text-[40px] whitespace-pre relative z-10 hidden group-hover:block" style={{
          background: 'linear-gradient(135deg, #549EFF 5%, #8570FF 74%, #A06EFF 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          backgroundSize: '200% 200%',
          animation: 'gradientShift 8s ease infinite'
        }}>Create Group</p>
      </button>
      <MaskGroup />
    </div>
  );
}

function Calendar() {
  return (
    <div className="absolute left-[14px] size-[60px] top-[13px]" data-name="Calendar">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 60 60">
        <g id="Calendar">
          <path d={svgPaths.p228d3c00} id="Icon" stroke="var(--stroke-0, #F3F3F3)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
        </g>
      </svg>
    </div>
  );
}

function Frame1({ onClick }: { onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="absolute bg-[rgba(11,11,11,0)] flex flex-col gap-[6px] items-center justify-center right-[20px] top-[15px] p-[8px] w-[52px] h-[52px] cursor-pointer transition-all duration-200 hover:opacity-80 active:opacity-60"
    >
      <div className="bg-white h-[2.5px] shrink-0 w-[36px]" />
      <div className="bg-white h-[2.5px] shrink-0 w-[36px]" />
      <div className="bg-white h-[2.5px] shrink-0 w-[36px]" />
    </button>
  );
}

export default function Desktop({ onMenuClick, onJoinGroupClick, onCreateGroupClick }: DesktopProps) {
  return (
    <div className="relative size-full" data-name="Desktop - 1">
      <LandingPageMainText />
      <Frame onJoinGroupClick={onJoinGroupClick} onCreateGroupClick={onCreateGroupClick} />
      <div className="absolute flex h-[50px] items-center justify-center left-[720px] top-[940px] w-0" style={{ "--transform-inner-width": "50", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-[90deg]">
          <div className="h-0 relative w-[50px]">
            <div className="absolute bottom-[-18.41px] left-0 right-[-5%] top-[-18.41px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 53 37">
                <path d={svgPaths.p1531c280} fill="var(--stroke-0, white)" id="Arrow 1" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <Calendar />
      <Frame1 onClick={onMenuClick} />
    </div>
  );
}