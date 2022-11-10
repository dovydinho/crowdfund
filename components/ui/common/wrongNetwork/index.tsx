export default function WrongNetwork({ network }) {
  return (
    <>
      <div className="flex items-center h-screen bg-gradient-to-r from-[#41295a] to-[#2F0743]">
        <div className="animate-pulse w-96 rounded-lg mx-auto p-4 bg-gray-50/10 border border-gray-500 text-center">
          <div>Connected to wrong network</div>
          <div>
            Please connect to: {` `}
            <span className="font-bold">{network.target}</span>
          </div>
        </div>
      </div>
    </>
  );
}
