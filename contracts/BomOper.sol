// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

/// @title BOM OPER
/// @notice Single-round pass-the-bomb game state for Monad Testnet.
contract BomOper {
    uint256 public constant TARGET_CHAIN_ID = 10143;
    uint256 public constant HOT_PENALTY_SECONDS = 3;
    uint256 public constant HOT_MIN_REMAINING_SECONDS = 6;

    enum RoomStatus {
        Waiting,
        Active,
        Finished
    }

    struct Room {
        bool exists;
        RoomStatus status;
        uint8 capacity;
        uint8 duration;
        address creator;
        address holder;
        address loser;
        uint256 turn;
        uint256 startedAt;
        uint256 deadline;
        uint256 finishedAt;
        address[] players;
    }

    /// @notice Stable, single-call view of one room for clients.
    /// `hotUsed[i]` corresponds to `players[i]`.
    struct RoomSnapshot {
        uint256 roomId;
        RoomStatus status;
        uint8 capacity;
        uint8 duration;
        address creator;
        address holder;
        uint256 turn;
        uint256 startedAt;
        uint256 deadline;
        address loser;
        uint256 finishedAt;
        address[] players;
        bool[] hotUsed;
    }

    error UnsupportedChain(uint256 actualChainId, uint256 expectedChainId);
    error UnknownRoom(uint256 roomId);
    error InvalidCapacity(uint8 capacity);
    error InvalidDuration(uint8 duration);
    error InvalidRoomStatus(uint256 roomId, RoomStatus actualStatus);
    error NotRoomMember(uint256 roomId, address account);
    error AlreadyJoined(uint256 roomId, address account);
    error RoomFull(uint256 roomId);
    error RoomNotFull(uint256 roomId, uint256 playerCount, uint8 capacity);
    error NotCurrentHolder(uint256 roomId, address holder, address caller);
    error InvalidRecipient(address recipient);
    error ExpectedTurnMismatch(uint256 expectedTurn, uint256 actualTurn);
    error DeadlinePassed(uint256 deadline);
    error DeadlineNotReached(uint256 deadline);
    error HotAlreadyUsed(uint256 roomId, address player);
    error HotWindowClosed(uint256 remainingSeconds);

    event RoomCreated(
        uint256 indexed roomId,
        address indexed creator,
        uint8 capacity,
        uint8 duration
    );
    event PlayerJoined(
        uint256 indexed roomId,
        address indexed player,
        uint256 playerCount
    );
    event RoomStarted(
        uint256 indexed roomId,
        address indexed starter,
        address indexed firstHolder,
        uint256 startedAt,
        uint256 deadline,
        uint256 turn
    );
    event BombPassed(
        uint256 indexed roomId,
        address indexed from,
        address indexed to,
        bool hot,
        uint256 turn,
        uint256 previousDeadline,
        uint256 newDeadline
    );
    event RoomFinished(
        uint256 indexed roomId,
        address indexed finalizer,
        address indexed loser,
        address[] players,
        uint256 finishedAt,
        uint256 turn
    );

    uint256 public nextRoomId = 1;

    mapping(uint256 roomId => Room room) private _rooms;
    mapping(uint256 roomId => mapping(address player => bool joined)) private _isMember;
    mapping(uint256 roomId => mapping(address player => bool used)) private _hotUsed;

    constructor() {
        if (block.chainid != TARGET_CHAIN_ID) {
            revert UnsupportedChain(block.chainid, TARGET_CHAIN_ID);
        }
    }

    /// @notice Create a waiting room; the creator is added exactly once.
    function createRoom(uint8 capacity, uint8 duration) external returns (uint256 roomId) {
        if (capacity < 2 || capacity > 4) revert InvalidCapacity(capacity);
        if (duration != 30 && duration != 60) revert InvalidDuration(duration);

        roomId = nextRoomId++;
        Room storage room = _rooms[roomId];
        room.exists = true;
        room.status = RoomStatus.Waiting;
        room.capacity = capacity;
        room.duration = duration;
        room.creator = msg.sender;
        room.holder = msg.sender;
        room.players.push(msg.sender);
        _isMember[roomId][msg.sender] = true;

        emit RoomCreated(roomId, msg.sender, capacity, duration);
        emit PlayerJoined(roomId, msg.sender, 1);
    }

    /// @notice Join an open room if capacity remains.
    function joinRoom(uint256 roomId) external {
        Room storage room = _getRoom(roomId);
        if (room.status != RoomStatus.Waiting) {
            revert InvalidRoomStatus(roomId, room.status);
        }
        if (_isMember[roomId][msg.sender]) revert AlreadyJoined(roomId, msg.sender);
        if (room.players.length >= room.capacity) revert RoomFull(roomId);

        _isMember[roomId][msg.sender] = true;
        room.players.push(msg.sender);
        emit PlayerJoined(roomId, msg.sender, room.players.length);
    }

    /// @notice Start only when every seat is filled; creator holds first.
    function startRoom(uint256 roomId) external {
        Room storage room = _getRoom(roomId);
        if (room.status != RoomStatus.Waiting) {
            revert InvalidRoomStatus(roomId, room.status);
        }
        _requireMember(roomId, msg.sender);
        if (room.players.length != room.capacity) {
            revert RoomNotFull(roomId, room.players.length, room.capacity);
        }

        room.status = RoomStatus.Active;
        room.startedAt = block.timestamp;
        room.deadline = block.timestamp + room.duration;
        room.holder = room.creator;

        emit RoomStarted(
            roomId,
            msg.sender,
            room.holder,
            room.startedAt,
            room.deadline,
            room.turn
        );
    }

    /// @notice Pass to another member; a hot pass consumes one use and 3 seconds.
    function passBomb(
        uint256 roomId,
        address recipient,
        bool hot,
        uint256 expectedTurn
    ) external {
        Room storage room = _getRoom(roomId);
        if (room.status != RoomStatus.Active) {
            revert InvalidRoomStatus(roomId, room.status);
        }
        if (block.timestamp >= room.deadline) revert DeadlinePassed(room.deadline);
        if (msg.sender != room.holder) {
            revert NotCurrentHolder(roomId, room.holder, msg.sender);
        }
        if (expectedTurn != room.turn) {
            revert ExpectedTurnMismatch(expectedTurn, room.turn);
        }
        if (
            recipient == address(0) || recipient == msg.sender
                || !_isMember[roomId][recipient]
        ) {
            revert InvalidRecipient(recipient);
        }

        uint256 previousDeadline = room.deadline;
        if (hot) {
            if (_hotUsed[roomId][msg.sender]) {
                revert HotAlreadyUsed(roomId, msg.sender);
            }
            uint256 remainingSeconds = room.deadline - block.timestamp;
            if (remainingSeconds <= HOT_MIN_REMAINING_SECONDS) {
                revert HotWindowClosed(remainingSeconds);
            }
            _hotUsed[roomId][msg.sender] = true;
            room.deadline -= HOT_PENALTY_SECONDS;
        }

        room.holder = recipient;
        room.turn += 1;
        emit BombPassed(
            roomId,
            msg.sender,
            recipient,
            hot,
            room.turn,
            previousDeadline,
            room.deadline
        );
    }

    /// @notice Finalize an expired active room; anyone can submit this transaction.
    function settleRoom(uint256 roomId) external {
        Room storage room = _getRoom(roomId);
        if (room.status != RoomStatus.Active) {
            revert InvalidRoomStatus(roomId, room.status);
        }
        if (block.timestamp < room.deadline) revert DeadlineNotReached(room.deadline);

        room.status = RoomStatus.Finished;
        room.loser = room.holder;
        room.finishedAt = block.timestamp;

        emit RoomFinished(
            roomId,
            msg.sender,
            room.loser,
            room.players,
            room.finishedAt,
            room.turn
        );
    }

    /// @notice Read the complete bounded snapshot for a room in one call.
    function getRoomSnapshot(uint256 roomId) external view returns (RoomSnapshot memory snapshot) {
        Room storage room = _getRoom(roomId);
        address[] memory players = room.players;
        bool[] memory hotUsed = new bool[](players.length);

        for (uint256 i; i < players.length; ++i) {
            hotUsed[i] = _hotUsed[roomId][players[i]];
        }

        snapshot = RoomSnapshot({
            roomId: roomId,
            status: room.status,
            capacity: room.capacity,
            duration: room.duration,
            creator: room.creator,
            holder: room.holder,
            turn: room.turn,
            startedAt: room.startedAt,
            deadline: room.deadline,
            loser: room.loser,
            finishedAt: room.finishedAt,
            players: players,
            hotUsed: hotUsed
        });
    }

    function _getRoom(uint256 roomId) private view returns (Room storage room) {
        room = _rooms[roomId];
        if (!room.exists) revert UnknownRoom(roomId);
    }

    function _requireMember(uint256 roomId, address account) private view {
        if (!_isMember[roomId][account]) revert NotRoomMember(roomId, account);
    }
}
